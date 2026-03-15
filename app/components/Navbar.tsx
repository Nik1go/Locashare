"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Wrench, LogOut, User, Loader2, MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group h-full py-2">
            <img 
              src="/logo.png" 
              alt="Karyacool Logo" 
              className="h-10 w-auto hidden md:block dark:brightness-110" 
            />
            <img 
              src="/logo2.png" 
              alt="Karyacool Logo" 
              className="h-8 w-auto md:hidden dark:brightness-110" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Accueil
            </Link>
            
            {status === "authenticated" && (
              <>
                <Link href="/tools/new" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Ajouter un outil
                </Link>
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Tableau de bord
                </Link>
                <Link href="/conversations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <MessageCircle size={18} />
                  Discussion
                </Link>
              </>
            )}
          </nav>

          {/* Right Section: Desktop Auth & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {status === "loading" ? (
                <Loader2 size={20} className="animate-spin text-slate-400" />
              ) : session?.user ? (
                <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4 ml-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className="hidden lg:inline font-medium">
                      {session.user.name || session.user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <LogOut size={16} />
                    <span className="hidden lg:inline">Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4 ml-1">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Connexion
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition"
            >
              Accueil
            </Link>
            
            {status === "authenticated" ? (
              <>
                <Link 
                  href="/tools/new" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition"
                >
                  Ajouter un outil
                </Link>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition"
                >
                  Tableau de bord
                </Link>
                <Link 
                  href="/conversations" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition"
                >
                  Mes discussions
                </Link>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center overflow-hidden">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {session?.user?.name || session?.user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center p-3 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
