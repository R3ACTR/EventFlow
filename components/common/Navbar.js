"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Menu, X, LogOut, UserCircle } from "lucide-react";
import Button from "./Button";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const { darkMode, toggleTheme } = useTheme();


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition group">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center shadow-lg shadow-neon-cyan/20 group-hover:shadow-neon-cyan/40 transition">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-wider">
              EventFlow
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-slate-400 hover:text-neon-cyan transition font-medium text-sm tracking-wide uppercase"
            >
              Features
            </Link>
            <Link
              href="/#benefits"
              className="text-slate-400 hover:text-neon-cyan transition font-medium text-sm tracking-wide uppercase"
            >
              Why EventFlow
            </Link>
            <Link
              href="/events"
              className="text-slate-400 hover:text-neon-cyan transition font-medium text-sm tracking-wide uppercase"
            >
              Browse Events
            </Link>
            <Link
              href="/verify"
              className="text-slate-400 hover:text-neon-cyan transition font-medium text-sm tracking-wide uppercase"
            >
              Verify Certificate
            </Link>
            {session && (
              <Link
                href={`/${session.user?.role || "participant"}`}
                className="text-slate-400 hover:text-neon-cyan transition font-medium text-sm tracking-wide uppercase"
              >
                Dashboard
              </Link>
            )}


          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {session.user?.avatarUrl ? (
                  <Link
                    href="/profile"
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 hover:border-neon-cyan/50 transition"
                    title="View Profile"
                  >
                    <img
                      src={session.user.avatarUrl}
                      alt={session.user.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center text-white font-bold text-sm border-2 border-white/10 hover:border-neon-cyan/50 transition"
                    title="View Profile"
                  >
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Link>
                )}
                <Button
                  variant="secondary"
                  className="text-slate-300 flex items-center gap-2 border-white/10 hover:border-neon-cyan/40 bg-white/5 hover:bg-white/10"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" className="text-slate-300 border-white/10 hover:border-neon-cyan/40 bg-white/5 hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="btn-neon border-0">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-400 hover:text-neon-cyan hover:bg-white/5 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/[0.06]">
            <div className="flex flex-col space-y-1">
              <Link
                href="/#features"
                className="text-slate-400 hover:text-neon-cyan hover:bg-white/5 px-4 py-2.5 rounded-lg transition font-medium text-sm tracking-wide uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#benefits"
                className="text-slate-400 hover:text-neon-cyan hover:bg-white/5 px-4 py-2.5 rounded-lg transition font-medium text-sm tracking-wide uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Why EventFlow
              </Link>
              <Link
                href="/events"
                className="text-slate-400 hover:text-neon-cyan hover:bg-white/5 px-4 py-2.5 rounded-lg transition font-medium text-sm tracking-wide uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Events
              </Link>
              {session && (
                <Link
                  href={`/${session.user?.role || "participant"}`}
                  className="text-slate-400 hover:text-neon-cyan hover:bg-white/5 px-4 py-2.5 rounded-lg transition font-medium text-sm tracking-wide uppercase"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="pt-3 space-y-2 px-4">
                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-slate-400 hover:text-neon-cyan hover:bg-white/5 px-4 py-2.5 rounded-lg transition font-medium text-sm cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Button
                      variant="secondary"
                      className="w-full justify-center text-slate-300 border-white/10 bg-white/5"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="secondary" className="w-full justify-center text-slate-300 border-white/10 bg-white/5">
                        Login
                      </Button>
                      <button
                        onClick={toggleTheme}
                        className="px-3 py-1 border rounded"
                      >
                        {darkMode ? "Light Mode" : "Dark Mode"}
                      </button>

                    </Link>
                    <Link href="/register" className="block">
                      <Button variant="primary" className="btn-neon w-full justify-center border-0">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}



