"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";
import { getPasswordStrength } from "@/utils/passwordStrength";
import useFocusTrap from "@/components/common/useFocusTrap";
import { handleFormKeyDown } from "@/components/common/keyboardNavigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
  });

  const [status, setStatus] = useState({
    error: "",
    success: "",
    loading: false,
  });

  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ error: "", success: "", loading: true });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

if (!res.ok) {
  const message =
    data?.message ||
    data?.error ||
    "Registration failed. Please try again.";

  throw new Error(message);
}

      setStatus({
        error: "",
        success: "Registration successful! Redirecting...",
        loading: false,
      });

      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
  setStatus({
    error: err?.message || "Something went wrong during registration.",
    success: "",
    loading: false,
  });
}
  };

  // Handle form keyboard navigation
  const handleFormKeyDownEvent = (e) => {
    handleFormKeyDown(e, {
      onSubmit: handleSubmit,
      onCancel: () => {
        // Clear form on Escape
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "participant",
        });
      },
      submitKey: 'Enter',
    });
  };
  const passwordStrength = getPasswordStrength(formData.password);

  // Focus trap for the form
  useFocusTrap({
    isOpen: true,
    containerRef: formRef,
    onClose: () => {},
    initialFocusRef: nameInputRef,
  });



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
                Create Account
              </h2>
              <p className="text-slate-400 text-sm font-mono">
                Join EventFlow and start organizing
              </p>
            </div>
          </div>

          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            onKeyDown={handleFormKeyDownEvent}
            className="space-y-6"
            role="form"
            aria-label="Registration form"
          >

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition"
                  placeholder="Enter your name"
                  autoComplete="name"
                  aria-describedby={status.error ? "register-error" : status.success ? "register-success" : undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition"
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-describedby={status.error ? "register-error" : status.success ? "register-success" : undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  aria-describedby={status.error ? "register-error" : status.success ? "register-success" : "password-strength"}
                />
              </div>

              {formData.password && (
                <div style={{ marginTop: "8px" }}>
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "4px",
                      background: "#1f2937",
                      overflow: "hidden",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        transition: "0.3s ease",
                        background:
                          passwordStrength.label === "Weak"
                            ? "#ef4444"
                            : passwordStrength.label === "Medium"
                              ? "#f59e0b"
                              : "#22c55e",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      color:
                        passwordStrength.label === "Weak"
                          ? "#f87171"
                          : passwordStrength.label === "Medium"
                            ? "#fbbf24"
                            : "#4ade80",
                    }}
                  >
                    Strength: {passwordStrength.label}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  I am a
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition appearance-none"
                >
                  <option value="participant" className="bg-space-900 text-slate-200">Participant</option>
                  <option value="organizer" className="bg-space-900 text-slate-200">Organizer</option>
                  <option value="mentor" className="bg-space-900 text-slate-200">Mentor</option>
                  <option value="judge" className="bg-space-900 text-slate-200">Judge</option>
                  <option value="admin" className="bg-space-900 text-slate-200">Admin</option>
                </select>
              </div>
            </div>

            {status.error && (
              <div 
                id="register-error"
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center mb-4"
                role="alert"
                aria-live="polite"
              >
                {status.error}
              </div>
            )}

            {status.success && (
              <div 
                id="register-success"
                className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center"
                role="status"
                aria-live="polite"
              >
                {status.success}
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="btn-neon w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold tracking-wide text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-space-900"
              aria-describedby={status.loading ? "submitting-status" : undefined}
            >
              {status.loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Sign Up"
              )}
              {!status.loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/participant" })}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-100 transition shadow-lg shadow-white/5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-space-900"
                aria-label="Sign up with Google"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" aria-hidden="true" />
                Sign up with Google
              </button>

              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/participant" })}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#24292e] text-white font-semibold text-sm hover:bg-[#2c3238] transition shadow-lg shadow-black/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-space-900"
                aria-label="Sign up with GitHub"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign up with GitHub
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-500 font-mono">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-neon-cyan hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neon-cyan rounded px-1"
              >
                Sign In
              </Link>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}




