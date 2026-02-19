"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";

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
        throw new Error(data.error || "Registration failed");
      }

      setStatus({
        error: "",
        success: "Registration successful! Redirecting...",
        loading: false,
      });

      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setStatus({
        error: err.message || "Something went wrong.",
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
                Create Account
              </h2>
              <p className="text-slate-400 text-sm font-mono">
                Join EventFlow and start organizing
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition"
                  placeholder="Enter your name"
                />
              </div>

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
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition"
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
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition"
                  placeholder="Create a password"
                />
              </div>

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
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center mb-4">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                {status.success}
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="btn-neon w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold tracking-wide text-sm"
            >
              {status.loading ? "Creating Account..." : "Sign Up"}
              {!status.loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="mt-6 text-center text-sm text-slate-500 font-mono">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-neon-cyan hover:text-white transition"
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
