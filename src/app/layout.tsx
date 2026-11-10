import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { CredoraProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Credora — Smarter Credit. Better Decisions.",
  description:
    "Credit intelligence platform for managing applications, assessing default risk, and monitoring portfolio quality.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <CredoraProvider>
          <I18nProvider>{children}</I18nProvider>
        </CredoraProvider>
      </body>
    </html>
  );
}
