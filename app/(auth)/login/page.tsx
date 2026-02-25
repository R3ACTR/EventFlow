"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, Github } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        throw new Error("Invalid credentials. Please check your email and password.");
      }

      setStatus({
        error: "",
        success: "Login successful! Redirecting...",
        loading: false,
      });

      // The middleware or auth config usually handles role-based routing
      // If not, we can push to a generic dashboard or let it refresh
      router.push("/participant");
      router.refresh();

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
              title={
                status.loading
                  ? "Please wait..."
                  : "Please fill all required fields"
              }
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
                  signIn("google", { callbackUrl: "/participant" });
                }}
                disabled={socialLoading}
                title={socialLoading ? "Signing in..." : undefined}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-60 hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>

              <button
                type="button"
                onClick={() => {
                  setSocialLoading(true);
                  signIn("github", { callbackUrl: "/participant" });
                }}
                disabled={socialLoading}
                title={socialLoading ? "Signing in..." : undefined}
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