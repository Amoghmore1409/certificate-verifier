/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/certichain.json`.
 */
export type Certichain = {
  "address": "8exNmXgWUKijpNmQTAGhpaLeXSorGZmcExT2LTrFhogj",
  "metadata": {
    "name": "certichain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "CertiChain — On-chain certificate issuance and verification on Solana"
  },
  "instructions": [
    {
      "name": "initializeAdmin",
      "docs": [
        "Initialize the admin / DAO account.",
        "The signer becomes the sole authority who can verify or revoke issuers."
      ],
      "discriminator": [
        35,
        176,
        8,
        143,
        42,
        160,
        61,
        158
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "issueCertificate",
      "docs": [
        "Issue a new certificate. Only **verified, non-revoked** issuers may call.",
        "The certificate PDA is derived from the issuer authority + certificate_id."
      ],
      "discriminator": [
        61,
        197,
        55,
        28,
        159,
        18,
        132,
        128
      ],
      "accounts": [
        {
          "name": "certificate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  101,
                  114,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "certificateId"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  115,
                  115,
                  117,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "issuer"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "studentName",
          "type": "string"
        },
        {
          "name": "courseName",
          "type": "string"
        },
        {
          "name": "certificateHash",
          "type": "string"
        },
        {
          "name": "certificateId",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerIssuer",
      "docs": [
        "Register a new issuer. Starts as **unverified** — the admin must",
        "call `verify_issuer` before this account can issue certificates."
      ],
      "discriminator": [
        145,
        117,
        52,
        59,
        189,
        27,
        127,
        18
      ],
      "accounts": [
        {
          "name": "issuer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  115,
                  115,
                  117,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "institutionName",
          "type": "string"
        }
      ]
    },
    {
      "name": "revokeCertificate",
      "docs": [
        "Revoke a certificate. Only the **original issuer** may revoke."
      ],
      "discriminator": [
        236,
        5,
        130,
        119,
        9,
        164,
        130,
        122
      ],
      "accounts": [
        {
          "name": "certificate",
          "writable": true
        },
        {
          "name": "issuer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  115,
                  115,
                  117,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "issuer"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "revokeIssuer",
      "docs": [
        "Admin revokes an issuer, permanently blocking further issuance."
      ],
      "discriminator": [
        17,
        145,
        62,
        240,
        50,
        135,
        145,
        181
      ],
      "accounts": [
        {
          "name": "admin",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "issuer",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "verifyIssuer",
      "docs": [
        "Admin verifies an issuer, unlocking their ability to issue certificates."
      ],
      "discriminator": [
        175,
        158,
        45,
        6,
        185,
        85,
        67,
        61
      ],
      "accounts": [
        {
          "name": "admin",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "issuer",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "adminAccount",
      "discriminator": [
        153,
        119,
        180,
        178,
        43,
        66,
        235,
        148
      ]
    },
    {
      "name": "certificateAccount",
      "discriminator": [
        9,
        141,
        26,
        14,
        246,
        14,
        202,
        133
      ]
    },
    {
      "name": "issuerAccount",
      "discriminator": [
        126,
        234,
        14,
        239,
        71,
        204,
        88,
        61
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "institutionNameTooLong",
      "msg": "Institution name exceeds maximum length of 64 characters"
    },
    {
      "code": 6001,
      "name": "emptyInstitutionName",
      "msg": "Institution name cannot be empty"
    },
    {
      "code": 6002,
      "name": "studentNameTooLong",
      "msg": "Student name exceeds maximum length of 64 characters"
    },
    {
      "code": 6003,
      "name": "courseNameTooLong",
      "msg": "Course name exceeds maximum length of 128 characters"
    },
    {
      "code": 6004,
      "name": "certificateHashTooLong",
      "msg": "Certificate hash exceeds maximum length of 64 characters"
    },
    {
      "code": 6005,
      "name": "certificateIdTooLong",
      "msg": "Certificate ID exceeds maximum length of 64 characters"
    },
    {
      "code": 6006,
      "name": "emptyField",
      "msg": "Required field cannot be empty"
    },
    {
      "code": 6007,
      "name": "issuerNotVerified",
      "msg": "Issuer is not verified by admin"
    },
    {
      "code": 6008,
      "name": "issuerRevoked",
      "msg": "Issuer has been revoked"
    },
    {
      "code": 6009,
      "name": "unauthorizedAdmin",
      "msg": "Unauthorized: not the admin authority"
    },
    {
      "code": 6010,
      "name": "unauthorizedIssuer",
      "msg": "Unauthorized: not the issuer authority"
    },
    {
      "code": 6011,
      "name": "certificateAlreadyRevoked",
      "msg": "Certificate has already been revoked"
    },
    {
      "code": 6012,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "adminAccount",
      "docs": [
        "Global admin / DAO account — controls issuer verification."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Wallet that has admin privileges"
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "When the admin was initialized (unix ts)"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "certificateAccount",
      "docs": [
        "Certificate account — an immutable, on-chain credential."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "docs": [
              "Public key of the issuer who created this certificate"
            ],
            "type": "pubkey"
          },
          {
            "name": "studentName",
            "docs": [
              "Name of the student / recipient"
            ],
            "type": "string"
          },
          {
            "name": "courseName",
            "docs": [
              "Name of the course or credential"
            ],
            "type": "string"
          },
          {
            "name": "certificateHash",
            "docs": [
              "SHA-256 hash of the full certificate data"
            ],
            "type": "string"
          },
          {
            "name": "certificateId",
            "docs": [
              "Unique identifier (used in PDA derivation)"
            ],
            "type": "string"
          },
          {
            "name": "issuedAt",
            "docs": [
              "Unix timestamp when issued"
            ],
            "type": "i64"
          },
          {
            "name": "isRevoked",
            "docs": [
              "Whether this certificate has been revoked"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "issuerAccount",
      "docs": [
        "Issuer account — represents an institution that can issue certificates."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Wallet that owns this issuer profile"
            ],
            "type": "pubkey"
          },
          {
            "name": "institutionName",
            "docs": [
              "Human-readable institution name"
            ],
            "type": "string"
          },
          {
            "name": "isVerified",
            "docs": [
              "Set to `true` by admin to unlock issuance"
            ],
            "type": "bool"
          },
          {
            "name": "isRevoked",
            "docs": [
              "Set to `true` by admin to permanently block issuance"
            ],
            "type": "bool"
          },
          {
            "name": "certificatesIssued",
            "docs": [
              "Running count of certificates issued"
            ],
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "docs": [
              "Reputation score — +10 per certificate issued"
            ],
            "type": "u64"
          },
          {
            "name": "registeredAt",
            "docs": [
              "Unix timestamp of registration"
            ],
            "type": "i64"
          }
        ]
      }
    }
  ]
};
