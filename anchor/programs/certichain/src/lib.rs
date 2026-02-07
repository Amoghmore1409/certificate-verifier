use anchor_lang::prelude::*;

declare_id!("8exNmXgWUKijpNmQTAGhpaLeXSorGZmcExT2LTrFhogj");

// ============================================================================
// CertiChain — On-Chain Certificate Issuance & Verification
// ============================================================================
//
// This Anchor program enables verified institutions to issue tamper-proof
// certificates on Solana. Certificates are stored as PDAs and can be
// verified by anyone directly from the blockchain.
//
// Architecture:
//   AdminAccount  (PDA: ["admin"])
//       └─ controls issuer verification
//   IssuerAccount (PDA: ["issuer", authority])
//       └─ represents an institution
//   CertificateAccount (PDA: ["certificate", issuer_authority, cert_id])
//       └─ immutable on-chain credential
// ============================================================================

/// Maximum length for institution name
const MAX_INSTITUTION_NAME_LEN: usize = 64;
/// Maximum length for student name
const MAX_STUDENT_NAME_LEN: usize = 64;
/// Maximum length for course / credential name
const MAX_COURSE_NAME_LEN: usize = 128;
/// Maximum length for certificate hash (SHA-256 hex = 64 chars)
const MAX_CERTIFICATE_HASH_LEN: usize = 64;
/// Maximum length for certificate unique identifier
const MAX_CERTIFICATE_ID_LEN: usize = 64;

#[program]
pub mod certichain {
    use super::*;

    // ------------------------------------------------------------------
    // 1. ADMIN — one-time setup
    // ------------------------------------------------------------------

    /// Initialize the admin / DAO account.
    /// The signer becomes the sole authority who can verify or revoke issuers.
    pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        admin.authority = ctx.accounts.authority.key();
        admin.created_at = Clock::get()?.unix_timestamp;

        msg!("✅ CertiChain admin initialized: {}", admin.authority);
        Ok(())
    }

    // ------------------------------------------------------------------
    // 2. ISSUER MANAGEMENT
    // ------------------------------------------------------------------

    /// Register a new issuer. Starts as **unverified** — the admin must
    /// call `verify_issuer` before this account can issue certificates.
    pub fn register_issuer(
        ctx: Context<RegisterIssuer>,
        institution_name: String,
    ) -> Result<()> {
        require!(
            institution_name.len() <= MAX_INSTITUTION_NAME_LEN,
            CertiChainError::InstitutionNameTooLong
        );
        require!(
            !institution_name.is_empty(),
            CertiChainError::EmptyInstitutionName
        );

        let issuer = &mut ctx.accounts.issuer;
        issuer.authority = ctx.accounts.authority.key();
        issuer.institution_name = institution_name.clone();
        issuer.is_verified = false;
        issuer.is_revoked = false;
        issuer.certificates_issued = 0;
        issuer.reputation_score = 0;
        issuer.registered_at = Clock::get()?.unix_timestamp;

        msg!(
            "📝 Issuer registered: {} ({})",
            institution_name,
            issuer.authority
        );
        Ok(())
    }

    /// Admin verifies an issuer, unlocking their ability to issue certificates.
    pub fn verify_issuer(ctx: Context<ManageIssuer>) -> Result<()> {
        let issuer = &mut ctx.accounts.issuer;

        require!(!issuer.is_revoked, CertiChainError::IssuerRevoked);

        issuer.is_verified = true;

        msg!("✅ Issuer verified: {}", issuer.institution_name);
        Ok(())
    }

    /// Admin revokes an issuer, permanently blocking further issuance.
    pub fn revoke_issuer(ctx: Context<ManageIssuer>) -> Result<()> {
        let issuer = &mut ctx.accounts.issuer;
        issuer.is_verified = false;
        issuer.is_revoked = true;

        msg!("🚫 Issuer revoked: {}", issuer.institution_name);
        Ok(())
    }

    // ------------------------------------------------------------------
    // 3. CERTIFICATE ISSUANCE
    // ------------------------------------------------------------------

    /// Issue a new certificate. Only **verified, non-revoked** issuers may call.
    /// The certificate PDA is derived from the issuer authority + certificate_id.
    pub fn issue_certificate(
        ctx: Context<IssueCertificate>,
        student_name: String,
        course_name: String,
        certificate_hash: String,
        certificate_id: String,
    ) -> Result<()> {
        // ---- validate inputs ----
        require!(
            student_name.len() <= MAX_STUDENT_NAME_LEN,
            CertiChainError::StudentNameTooLong
        );
        require!(
            course_name.len() <= MAX_COURSE_NAME_LEN,
            CertiChainError::CourseNameTooLong
        );
        require!(
            certificate_hash.len() <= MAX_CERTIFICATE_HASH_LEN,
            CertiChainError::CertificateHashTooLong
        );
        require!(
            certificate_id.len() <= MAX_CERTIFICATE_ID_LEN,
            CertiChainError::CertificateIdTooLong
        );
        require!(
            !student_name.is_empty()
                && !course_name.is_empty()
                && !certificate_hash.is_empty()
                && !certificate_id.is_empty(),
            CertiChainError::EmptyField
        );

        // ---- issuer authorisation ----
        let issuer = &ctx.accounts.issuer;
        require!(issuer.is_verified, CertiChainError::IssuerNotVerified);
        require!(!issuer.is_revoked, CertiChainError::IssuerRevoked);

        // ---- populate certificate ----
        let certificate = &mut ctx.accounts.certificate;
        certificate.issuer = ctx.accounts.authority.key();
        certificate.student_name = student_name.clone();
        certificate.course_name = course_name.clone();
        certificate.certificate_hash = certificate_hash;
        certificate.certificate_id = certificate_id;
        certificate.issued_at = Clock::get()?.unix_timestamp;
        certificate.is_revoked = false;

        // ---- update issuer stats ----
        let issuer_mut = &mut ctx.accounts.issuer;
        issuer_mut.certificates_issued = issuer_mut
            .certificates_issued
            .checked_add(1)
            .ok_or(CertiChainError::Overflow)?;
        issuer_mut.reputation_score = issuer_mut
            .reputation_score
            .checked_add(10)
            .ok_or(CertiChainError::Overflow)?;

        msg!(
            "🎓 Certificate issued → {} | {} | by {}",
            student_name,
            course_name,
            issuer_mut.institution_name
        );
        Ok(())
    }

    // ------------------------------------------------------------------
    // 4. CERTIFICATE REVOCATION
    // ------------------------------------------------------------------

    /// Revoke a certificate. Only the **original issuer** may revoke.
    pub fn revoke_certificate(ctx: Context<RevokeCertificate>) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;

        require!(
            !certificate.is_revoked,
            CertiChainError::CertificateAlreadyRevoked
        );
        require!(
            certificate.issuer == ctx.accounts.authority.key(),
            CertiChainError::UnauthorizedIssuer
        );

        certificate.is_revoked = true;

        msg!("🚫 Certificate revoked: {}", certificate.certificate_id);
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STATE
// ============================================================================

/// Global admin / DAO account — controls issuer verification.
#[account]
pub struct AdminAccount {
    /// Wallet that has admin privileges
    pub authority: Pubkey,
    /// When the admin was initialized (unix ts)
    pub created_at: i64,
}

impl AdminAccount {
    pub const LEN: usize = 8 // discriminator
        + 32  // authority
        + 8; // created_at
}

/// Issuer account — represents an institution that can issue certificates.
#[account]
pub struct IssuerAccount {
    /// Wallet that owns this issuer profile
    pub authority: Pubkey,
    /// Human-readable institution name
    pub institution_name: String,
    /// Set to `true` by admin to unlock issuance
    pub is_verified: bool,
    /// Set to `true` by admin to permanently block issuance
    pub is_revoked: bool,
    /// Running count of certificates issued
    pub certificates_issued: u64,
    /// Reputation score — +10 per certificate issued
    pub reputation_score: u64,
    /// Unix timestamp of registration
    pub registered_at: i64,
}

impl IssuerAccount {
    pub const LEN: usize = 8   // discriminator
        + 32                    // authority
        + (4 + MAX_INSTITUTION_NAME_LEN) // institution_name
        + 1                     // is_verified
        + 1                     // is_revoked
        + 8                     // certificates_issued
        + 8                     // reputation_score
        + 8;                    // registered_at
}

/// Certificate account — an immutable, on-chain credential.
#[account]
pub struct CertificateAccount {
    /// Public key of the issuer who created this certificate
    pub issuer: Pubkey,
    /// Name of the student / recipient
    pub student_name: String,
    /// Name of the course or credential
    pub course_name: String,
    /// SHA-256 hash of the full certificate data
    pub certificate_hash: String,
    /// Unique identifier (used in PDA derivation)
    pub certificate_id: String,
    /// Unix timestamp when issued
    pub issued_at: i64,
    /// Whether this certificate has been revoked
    pub is_revoked: bool,
}

impl CertificateAccount {
    pub const LEN: usize = 8   // discriminator
        + 32                              // issuer
        + (4 + MAX_STUDENT_NAME_LEN)      // student_name
        + (4 + MAX_COURSE_NAME_LEN)       // course_name
        + (4 + MAX_CERTIFICATE_HASH_LEN)  // certificate_hash
        + (4 + MAX_CERTIFICATE_ID_LEN)    // certificate_id
        + 8                               // issued_at
        + 1;                              // is_revoked
}

// ============================================================================
// INSTRUCTION CONTEXTS
// ============================================================================

/// Initialise the global admin PDA (one-time).
#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
    #[account(
        init,
        payer = authority,
        space = AdminAccount::LEN,
        seeds = [b"admin"],
        bump
    )]
    pub admin: Account<'info, AdminAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Self-register as an issuer (starts unverified).
#[derive(Accounts)]
pub struct RegisterIssuer<'info> {
    #[account(
        init,
        payer = authority,
        space = IssuerAccount::LEN,
        seeds = [b"issuer", authority.key().as_ref()],
        bump
    )]
    pub issuer: Account<'info, IssuerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Admin-only operations on an issuer (verify / revoke).
#[derive(Accounts)]
pub struct ManageIssuer<'info> {
    #[account(
        seeds = [b"admin"],
        bump,
        has_one = authority @ CertiChainError::UnauthorizedAdmin
    )]
    pub admin: Account<'info, AdminAccount>,

    #[account(mut)]
    pub issuer: Account<'info, IssuerAccount>,

    pub authority: Signer<'info>,
}

/// Issue a new certificate (verified issuer only).
#[derive(Accounts)]
#[instruction(student_name: String, course_name: String, certificate_hash: String, certificate_id: String)]
pub struct IssueCertificate<'info> {
    #[account(
        init,
        payer = authority,
        space = CertificateAccount::LEN,
        seeds = [
            b"certificate",
            authority.key().as_ref(),
            certificate_id.as_bytes()
        ],
        bump
    )]
    pub certificate: Account<'info, CertificateAccount>,

    #[account(
        mut,
        seeds = [b"issuer", authority.key().as_ref()],
        bump,
        has_one = authority @ CertiChainError::UnauthorizedIssuer
    )]
    pub issuer: Account<'info, IssuerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Revoke a certificate (original issuer only).
#[derive(Accounts)]
pub struct RevokeCertificate<'info> {
    #[account(mut)]
    pub certificate: Account<'info, CertificateAccount>,

    #[account(
        seeds = [b"issuer", authority.key().as_ref()],
        bump,
        has_one = authority @ CertiChainError::UnauthorizedIssuer
    )]
    pub issuer: Account<'info, IssuerAccount>,

    pub authority: Signer<'info>,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum CertiChainError {
    #[msg("Institution name exceeds maximum length of 64 characters")]
    InstitutionNameTooLong,

    #[msg("Institution name cannot be empty")]
    EmptyInstitutionName,

    #[msg("Student name exceeds maximum length of 64 characters")]
    StudentNameTooLong,

    #[msg("Course name exceeds maximum length of 128 characters")]
    CourseNameTooLong,

    #[msg("Certificate hash exceeds maximum length of 64 characters")]
    CertificateHashTooLong,

    #[msg("Certificate ID exceeds maximum length of 64 characters")]
    CertificateIdTooLong,

    #[msg("Required field cannot be empty")]
    EmptyField,

    #[msg("Issuer is not verified by admin")]
    IssuerNotVerified,

    #[msg("Issuer has been revoked")]
    IssuerRevoked,

    #[msg("Unauthorized: not the admin authority")]
    UnauthorizedAdmin,

    #[msg("Unauthorized: not the issuer authority")]
    UnauthorizedIssuer,

    #[msg("Certificate has already been revoked")]
    CertificateAlreadyRevoked,

    #[msg("Arithmetic overflow")]
    Overflow,
}
