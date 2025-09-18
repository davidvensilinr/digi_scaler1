import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import InstallButton from "./_components/InstallButtonWrapper";
import SwRegister from "./_components/SwRegister";

// Initialize the Inter font with required subsets and display settings
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Viewport configuration for PWA
export const viewport = {
  themeColor: "#0ea5e9",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Digi Scaler",
  description: "Digi Scaler - Scale your digital presence",
  applicationName: 'Digi Scaler',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Digi Scaler',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Digi Scaler',
    title: 'Digi Scaler - Scale your digital presence',
    description: 'The best way to scale your digital presence',
  },
  twitter: {
    card: 'summary',
    title: 'Digi Scaler',
    description: 'Scale your digital presence',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/api/manifest" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <InstallButton />
          <SwRegister />
        </Providers>
      </body>
    </html>
  );
}
