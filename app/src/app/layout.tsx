import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "CertiChain — On-Chain Certificate Verification",
  description:
    "Issue and verify tamper-proof certificates on Solana. Powered by Anchor smart contracts and QR-based instant verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <AnimatedBackground />
          <Navbar />
          <main className="pt-16 min-h-screen relative z-10">{children}</main>
          <Footer />
        </WalletContextProvider>
      </body>
    </html>
  );
}
