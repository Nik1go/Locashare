"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Wrench, LogOut, User, Loader2, MessageCircle } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img src="/logo.png" alt="Karyacool Logo" className="h-10 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition">
              Accueil
            </Link>
            
            {/* Liens protégés : seulement si connecté */}
            {status === "authenticated" && (
              <>
                <Link href="/tools/new" className="hover:text-blue-600 transition">
                  Ajouter un outil
                </Link>
                <Link href="/dashboard" className="hover:text-blue-600 transition">
                  Tableau de bord
                </Link>
                <Link href="/conversations" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <MessageCircle size={18} />
                  Discussion
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <Loader2 size={20} className="animate-spin text-slate-400" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg shadow-sm"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
