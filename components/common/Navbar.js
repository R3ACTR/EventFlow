"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Menu, X, User as UserIcon, LogOut } from "lucide-react"; // Renamed User to UserIcon to avoid conflict
import Button from "./Button";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">EventFlow</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-slate-600 hover:text-slate-900 transition font-medium"
            >
              Features
            </Link>
            <Link
              href="/#benefits"
              className="text-slate-600 hover:text-slate-900 transition font-medium"
            >
              Why EventFlow
            </Link>
            <Link
              href="/events"
              className="text-slate-600 hover:text-slate-900 transition font-medium"
            >
              Browse Events
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm font-medium text-slate-600">
                  {session.user?.name}
                </span>
                <Button
                  variant="secondary"
                  className="text-slate-700 flex items-center gap-2"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" className="text-slate-700">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
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
          <div className="md:hidden pb-4 pt-2 border-t border-slate-200">
            <div className="flex flex-col space-y-3">
              <Link
                href="/#features"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#benefits"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Why EventFlow
              </Link>
              <Link
                href="/events"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Events
              </Link>
              <div className="pt-3 space-y-2">
                {session ? (
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => signOut()}
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="secondary" className="w-full justify-center">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button variant="primary" className="w-full justify-center">
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
