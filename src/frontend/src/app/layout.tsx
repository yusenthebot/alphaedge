import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlphaEdge — Trade US Stocks with Chinese Market Intelligence",
  description:
    "AI-powered signals combining Jin10 Chinese financial news, sentiment analysis, and technical indicators for US stock trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistMono.variable} ${pressStart2P.variable} antialiased`}
        style={{ backgroundColor: "var(--pixel-bg)", color: "var(--pixel-text)", fontFamily: "var(--font-mono)" }}
      >
        {/* CRT vignette */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)",
            pointerEvents: "none",
            zIndex: 9997,
          }}
        />
        {children}
      </body>
    </html>
  );
}
