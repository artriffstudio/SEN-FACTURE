import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SEN FACTURE — Facturation simplifiée pour entrepreneurs africains",
    template: "%s | SEN FACTURE",
  },
  description:
    "Créez, envoyez et suivez vos factures en quelques clics. L'outil de facturation conçu pour les entrepreneurs africains.",
  keywords: [
    "facturation",
    "facture",
    "entrepreneur",
    "Afrique",
    "Sénégal",
    "CFA",
    "SaaS",
    "gestion",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          {children}
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
      </body>
    </html>
  );
}
