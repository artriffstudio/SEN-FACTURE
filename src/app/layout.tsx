import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: "Facturim — La solution de facturation de référence en Mauritanie",
    template: "%s | Facturim",
  },
  description:
    "Créez, envoyez et suivez vos factures avec TVA 16%, encaissez par Bankily & Masrvi via Moosyl en Ouguiya (MRU). Conforme DGI Mauritanie.",
  keywords: [
    "Facturim",
    "facturation Mauritanie",
    "TVA 16% Mauritanie",
    "Bankily facturation",
    "Masrvi paiement",
    "Moosyl Mauritanie",
    "Ouguiya MRU",
    "NIF Mauritanie",
    "SaaS facturation Nouakchott",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Facturim" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <OfflineIndicator />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1f2937",
                  color: "#f9fafb",
                  borderRadius: "8px",
                  fontSize: "14px",
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
