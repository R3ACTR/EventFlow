import Link from "next/link";
import {
    Calendar,
    Users,
    Trophy,
    GitBranch,
    Shield,
    Zap,
    CheckCircle,
    ArrowRight,
    Star,
    Code,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";

const features = [
    {
        icon: Calendar,
        title: "Event Management",
        description:
            "Create and manage multiple events with configurable timelines, rules, and visibility settings.",
    },
    {
        icon: Users,
        title: "Team Formation",
        description:
            "Easy team creation with invite codes, member management, and team size validation.",
    },
    {
        icon: Trophy,
        title: "Judge Evaluation",
        description:
            "Custom scoring rubrics, blind judging support, and automated ranking with score aggregation.",
    },
    {
        icon: GitBranch,
        title: "Project Submissions",
        description:
            "Phase-wise submissions with GitHub repo linking and deadline enforcement.",
    },
    {
        icon: Shield,
        title: "Role-Based Access",
        description:
            "Secure dashboards for Admins, Participants, Mentors, and Judges with clear permission boundaries.",
    },
    {
        icon: Zap,
        title: "Modular Architecture",
        description:
            "Enable only what your event needs. Each module can be toggled per event.",
    },
];

const benefits = [
    "Replace scattered Google Forms, Sheets, and emails",
    "Fair and transparent judging system",
    "Auto-generated certificates and badges",
    "Reusable infrastructure for any event",
    "Open source and community-driven",
    "Easy onboarding for contributors",
];

export default function Home() {
    return (
        <main className="min-h-screen bg-space-900 relative">
            {/* Navigation */}
            <Navbar />

            {/* Aurora Background - Full screen behind hero */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Aurora
                    colorStops={["#00ff87", "#60a5fa", "#00ff87"]}
                    amplitude={1.2}
                    blend={0.6}
                    speed={0.8}
                />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full text-neon-cyan text-sm font-medium mb-8 backdrop-blur-sm">
                        <Star className="w-4 h-4" />
                        Open Source Event Infrastructure
                    </div>
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-normal text-white mb-8 leading-[1.1] tracking-tight font-serif italic">
                        Run Hackathons <span className="font-serif italic text-neon-cyan">&</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-cyan to-white/80 animate-pulse-glow">
                            Tech Events
                        </span>{" "}
                        Seamlessly
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed font-mono">
                        EventFlow is a modular, open-source platform that
                        provides the complete digital infrastructure to run
                        hackathons, OSS programs, and community tech events —
                        all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/register"
                            className="btn-neon inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 tracking-wide text-sm"
                        >
                            Start Organizing
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="https://github.com/R3ACTR/EventFlow"
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm"
                        >
                            <Code className="w-5 h-5" />
                            View on GitHub
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { value: "100%", label: "Open Source" },
                            { value: "4+", label: "User Roles" },
                            { value: "7+", label: "Modules" },
                            { value: "MIT", label: "License" },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="glass-card rounded-xl p-5 text-center transition-all duration-300"
                            >
                                <div className="text-2xl sm:text-3xl font-bold text-white text-glow">
                                    {stat.value}
                                </div>
                                <div className="text-slate-500 text-sm mt-1 uppercase tracking-wider font-mono">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                            Everything You Need to Run Events
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-mono">
                            A comprehensive suite of tools designed specifically
                            for hackathons and tech events.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="glass-card border-glow p-8 rounded-2xl transition-all duration-400 group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 rounded-xl flex items-center justify-center mb-6 border border-neon-cyan/10 group-hover:border-neon-cyan/30 transition-colors">
                                    <feature.icon className="w-6 h-6 text-neon-cyan" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3 tracking-wide text-base">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-sm font-mono">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
                                Why Choose EventFlow?
                            </h2>
                            <p className="text-lg text-slate-400 mb-8 font-mono">
                                Stop juggling disconnected tools. EventFlow
                                brings everything into one extensible system —
                                built for organizers, participants, mentors, and
                                judges.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 group"
                                    >
                                        <CheckCircle className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5 group-hover:drop-shadow-[0_0_6px_rgba(0,255,135,0.5)] transition" />
                                        <span className="text-slate-300 text-base font-mono">
                                            {benefit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass-card rounded-3xl p-8 border-glow">
                            <h3 className="text-2xl font-bold text-white mb-6 tracking-wide text-lg">
                                Role-Based Dashboards
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { title: "Admin Dashboard", desc: "Manage events, users, and system settings" },
                                    { title: "Participant Dashboard", desc: "Track projects, teams, and submissions" },
                                    { title: "Judge Dashboard", desc: "Evaluate projects with custom rubrics" },
                                    { title: "Mentor Dashboard", desc: "Guide teams and track mentorship" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-neon-cyan/20 transition-colors">
                                        <div className="font-semibold mb-1 text-white">
                                            {item.title}
                                        </div>
                                        <div className="text-slate-500 text-sm font-mono">
                                            {item.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card rounded-3xl p-12 sm:p-16 border-glow">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
                            Ready to Power Your Next Event?
                        </h2>
                        <p className="text-lg text-slate-400 mb-10 font-mono">
                            Join the open-source community and start running better
                            hackathons today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="btn-neon inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 tracking-wide text-sm"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                            >
                                Browse Events
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider">
                                EventFlow
                            </span>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link
                                href="/events"
                                className="text-slate-500 hover:text-neon-cyan transition text-sm uppercase tracking-wider"
                            >
                                Events
                            </Link>
                            <Link
                                href="https://github.com/R3ACTR/EventFlow"
                                target="_blank"
                                className="text-slate-500 hover:text-neon-cyan transition text-sm uppercase tracking-wider"
                            >
                                GitHub
                            </Link>
                            <Link
                                href="/login"
                                className="text-slate-500 hover:text-neon-cyan transition text-sm uppercase tracking-wider"
                            >
                                Login
                            </Link>
                        </div>
                        <div className="text-slate-600 text-sm">
                            Built with love for the open-source community
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
