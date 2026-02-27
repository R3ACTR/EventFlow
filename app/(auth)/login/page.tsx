"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, Github } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";

// Component that handles post-login redirect based on role
function LoginRedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasRedirected) {
      setHasRedirected(true);
      const userRole = session.user.role || "participant";
      const redirectMap: Record<string, string> = {
        admin: "/admin",
        organizer: "/organizer",
        judge: "/judge",
        mentor: "/mentor",
        participant: "/participant",
      };
      router.push(redirectMap[userRole] || "/participant");
      router.refresh();
    }
  }, [session, status, router, hasRedirected]);

  return null;
}

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({
    error: "",
    success: "",
    loading: false,
  });

  const [socialLoading, setSocialLoading] = useState(false);

  // ✅ Clear auth error when user starts typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (status.error) {
      setStatus((prev) => ({ ...prev, error: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ error: "", success: "", loading: true });

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error(
          "Invalid credentials. Please check your email and password."
        );
      }

      setStatus({
        error: "",
        success: "Login successful! Redirecting...",
        loading: false,
      });
    } catch (err: any) {
      setStatus({
        error: err?.message || "Something went wrong during login.",
        success: "",
        loading: false,
      });
    }
  };

  return (
    <main className="bg-space-900 relative min-h-screen">
      <Navbar />
      <LoginRedirectHandler />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#00ff87", "#60a5fa", "#00ff87"]}
          amplitude={1}
          blend={0.6}
          speed={0.8}
        />
      </div>

      <section className="relative z-10 flex justify-center py-32 px-4">
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
                Log in to EventFlow to manage your events
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            role="form"
            aria-label="Login form"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {status.error && (
              <div className="text-red-400 text-sm text-center">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="text-green-400 text-sm text-center">
                {status.success}
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="btn-neon w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            >
              {status.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
              {!status.loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setSocialLoading(true);
                  signIn("google", { callbackUrl: "/" });
                }}
                disabled={socialLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-60 hover:bg-slate-100 transition"
              >
                Sign in with Google
              </button>

              <button
                type="button"
                onClick={() => {
                  setSocialLoading(true);
                  signIn("github", { callbackUrl: "/" });
                }}
                disabled={socialLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#24292e] text-white font-semibold text-sm disabled:opacity-60 hover:bg-[#2f363d] transition"
              >
                <Github className="w-5 h-5 mb-[1px]" />
                Sign in with GitHub
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-neon-cyan">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}