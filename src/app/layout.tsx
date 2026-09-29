import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CookieConsent from "@/components/ui/CookieConsent";
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

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
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
    "Créez, envoyez et suivez vos factures avec TVA 16%, encaissez par Bankily, Masrvi, Sedad, Click, BIM Bank en Ouguiya (MRU). Conforme DGI Mauritanie.",
  keywords: [
    "Facturim",
    "facturation Mauritanie",
    "TVA 16% Mauritanie",
    "Bankily facturation",
    "Masrvi paiement",
    "Sedad Mauritanie",
    "Click BNM",
    "BIM Bank Mobile",
    "Ouguiya MRU",
    "NIF Mauritanie",
    "SaaS facturation Nouakchott",
  ],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/brand-pack/facturim-app-icon-512.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} h-full antialiased`}
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
            <CookieConsent />
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
