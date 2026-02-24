"use client";

import { useState, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Input, Label, FormField } from "@/components/ui/form";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";
import useFocusTrap from "@/components/common/useFocusTrap";
import { handleFormKeyDown } from "@/components/common/keyboardNavigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Focus trap for the form when needed
  useFocusTrap({
    isOpen: true,
    containerRef: formRef,
    onClose: () => {}, // No-op for page-level forms
    initialFocusRef: emailInputRef,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
if (result?.error) {
  const message =
    result.error === "CredentialsSignin"
      ? "Invalid email or password."
      : result.error;

  setError(message);
} else {
        const session = await getSession();
        const role = session?.user?.role || "participant";
        router.push(`/${role}`);
      }
    } catch (err) {
  setError(
    err?.message || "Something went wrong while signing in."
  );
} finally {
      setLoading(false);
    }
  };

  // Handle form keyboard navigation
  const onFormKeyDown = (e) => {
    handleFormKeyDown(e, {
      onSubmit: handleSubmit,
      onCancel: () => {
        // Clear form on Escape
        setEmail("");
        setPassword("");
      },
      submitKey: 'Enter',
    });
  };

  return (
    <main className="min-h-screen bg-space-900 relative">
      <Navbar />

      {/* Aurora background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#00ff87", "#60a5fa", "#00ff87"]}
          amplitude={1}
          blend={0.6}
          speed={0.8}
          time={0}
        />
      </div>

      <section className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="glass-card border-glow w-full max-w-md rounded-2xl p-10 backdrop-blur-xl">

          <div className="relative mb-8">
            <button
              onClick={() => router.push("/")}
              className="absolute -top-2 -left-2 p-2 rounded-lg text-slate-400 hover:text-neon-cyan hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-sm font-mono">
                Sign in to continue building
              </p>
            </div>
          </div>
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            onKeyDown={onFormKeyDown}
            className="space-y-6"
            role="form"
            aria-label="Login form"
          >
            <FormField>
              <Label>Email</Label>
              <Input
                ref={emailInputRef}
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-describedby={error ? "login-error" : undefined}
              />
            </FormField>

            <FormField>
              <Label>Password</Label>
              <Input
                ref={passwordInputRef}
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                aria-describedby={error ? "login-error" : undefined}
              />
            </FormField>

            {error && (
              <div 
                id="login-error" 
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <button
              ref={submitButtonRef}
              type="submit"
              disabled={loading}
              className="btn-neon w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold tracking-wide text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-space-900"
              aria-describedby={loading ? "submitting-status" : undefined}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/participant" })}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-100 transition shadow-lg shadow-white/5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-space-900"
              aria-label="Sign in with Google"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" aria-hidden="true" />
              Sign in with Google
            </button>

            <button
              onClick={() => signIn("github", { callbackUrl: "/participant" })}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#24292e] text-white font-semibold text-sm hover:bg-[#2c3238] transition shadow-lg shadow-black/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-space-900"
              aria-label="Sign in with GitHub"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500 font-mono">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-neon-cyan hover:text-white transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
