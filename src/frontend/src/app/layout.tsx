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
        {/* CRT Static Noise */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            animation: 'noiseShift 0.15s steps(1) infinite',
          }}
        />
        {children}
      </body>
    </html>
  );
}
