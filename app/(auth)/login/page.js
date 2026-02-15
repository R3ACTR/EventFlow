"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            console.log("Login response:", res.status, data);

            if (res.ok) {
                const role = data.user?.role || "participant";
                console.log("Redirecting to:", role);
                router.push("/" + role);
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url(/auth-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                padding: "40px",
                borderRadius: "16px",
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h2 style={{ 
                        fontSize: "32px", 
                        fontWeight: "700", 
                        color: "#ffffff",
                        marginBottom: "8px"
                    }}>
                        Welcome back
                    </h2>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ 
                            display: "block", 
                            fontSize: "12px", 
                            fontWeight: "600", 
                            color: "rgba(255, 255, 255, 0.8)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "8px"
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: "10px",
                                background: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                color: "#ffffff",
                                fontSize: "15px",
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "all 0.2s"
                            }}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ 
                            display: "block", 
                            fontSize: "12px", 
                            fontWeight: "600", 
                            color: "rgba(255, 255, 255, 0.8)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "8px"
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: "10px",
                                background: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                color: "#ffffff",
                                fontSize: "15px",
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "all 0.2s"
                            }}
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            padding: "12px", 
                            borderRadius: "8px",
                            background: "rgba(239, 68, 68, 0.15)", 
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#fca5a5",
                            fontSize: "13px",
                            textAlign: "center",
                            marginBottom: "16px"
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "10px",
                            background: loading ? "rgba(59, 130, 246, 0.6)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            color: "#ffffff",
                            fontWeight: "600",
                            fontSize: "15px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)"
                        }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={{ 
                    marginTop: "24px", 
                    textAlign: "center", 
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.6)"
                }}>
                    Don't have an account?{' '}
                    <a 
                        href="/register" 
                        style={{ 
                            color: "#60a5fa", 
                            fontWeight: "600",
                            textDecoration: "none"
                        }}
                    >
                        Sign Up
                    </a>
                </div>
            </div>
        </div>
    );
}
