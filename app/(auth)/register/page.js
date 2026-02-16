"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("participant");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => router.push("/login"), 1500);
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "14px 16px",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        color: "#ffffff",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box",
    };

    const labelStyle = {
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.8)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "8px"
    };

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
            backgroundImage: "url(/auth-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "440px",
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
                        Create Account
                    </h2>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>
                        Join EventFlow today
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            style={inputStyle}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            style={inputStyle}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            style={inputStyle}
                            placeholder="Create a password"
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={labelStyle}>I am a</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                            style={inputStyle}
                        >
                            <option value="participant" style={{ color: "#1f2937" }}>Participant</option>
                            <option value="mentor" style={{ color: "#1f2937" }}>Mentor</option>
                            <option value="judge" style={{ color: "#1f2937" }}>Judge</option>
                            <option value="admin" style={{ color: "#1f2937" }}>Admin</option>
                        </select>
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

                    {success && (
                        <div style={{
                            padding: "12px",
                            borderRadius: "8px",
                            background: "rgba(34, 197, 94, 0.15)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            color: "#86efac",
                            fontSize: "13px",
                            textAlign: "center",
                            marginBottom: "16px"
                        }}>
                            {success}
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
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                    <div style={{
                        marginTop: "24px",
                        textAlign: "center",
                        fontSize: "14px",
                        color: "rgba(255, 255, 255, 0.6)"
                    }}>
                        Already have an account?{' '}
                        <a
                            href="/login"
                            style={{
                                color: "#60a5fa",
                                fontWeight: "600",
                                textDecoration: "none"
                            }}
                        >
                            Sign In
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
