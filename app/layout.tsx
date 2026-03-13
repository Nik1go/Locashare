import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthProvider from "./components/SessionProvider";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prêt-Outils",
  description: "Location d'outils entre particuliers et professionnels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 border-box m-0`}>
        <AuthProvider>
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 mt-auto py-8 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Prêt-Outils. Tous droits réservés.</p>
              <div className="flex gap-4 text-sm text-slate-500">
                <Link href="#" className="hover:text-slate-900">Mentions légales</Link>
                <Link href="#" className="hover:text-slate-900">Contact</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
