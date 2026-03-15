import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthProvider from "./components/SessionProvider";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Karyacool",
  description: "Location d'outils entre particuliers et professionnels",
  icons: {
    icon: "/icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-box m-0 transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider>
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow flex flex-col w-full">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto py-8 w-full transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">© {new Date().getFullYear()} Karyacool. Tous droits réservés.</p>
                <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Mentions légales</Link>
                  <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</Link>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
