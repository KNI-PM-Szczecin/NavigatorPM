import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: "Indoor Navigation",
  description: "Advanced indoor navigation system",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const localesDir = path.join(process.cwd(), 'src/locales');
  const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
  
  const initialLocales = localeFiles.map(file => {
      const code = file.replace('.json', '');
      const content = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
      return { code, name: content.languageName };
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SettingsProvider>
          <LanguageProvider initialLocales={initialLocales}>
            <LanguageSwitcher />
            {children}
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
