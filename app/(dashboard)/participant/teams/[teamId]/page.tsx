'use client';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    Users,
    Calendar,
    Clock,
    Trophy,
    FileText,
    Copy,
    Check,
    ArrowLeft,
    Github,
    ExternalLink,
    Edit,
    Save,
    Trash2,
    X
} from "lucide-react";
import { Input, Label } from "@/components/ui/form"; // Assuming these exist

export default function TeamManagePage() {
    const params = useParams();
    const teamId = params?.teamId;
    const { data: session, status } = useSession();
    const router = useRouter();

    const [team, setTeam] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteCodeCopied, setInviteCodeCopied] = useState(false);

    // Submission Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [repoLink, setRepoLink] = useState("");
    const [demoLink, setDemoLink] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            fetchTeamData();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, teamId]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Team Details
            const teamRes = await fetch(`/api/teams/${teamId}`);
            if (!teamRes.ok) {
                if (teamRes.status === 404) {
                    // Handle not found
                    console.error("Team not found");
                }
                throw new Error("Failed to fetch team");
            }
            const teamData = await teamRes.json();
            setTeam(teamData.team);

            // 2. Fetch Project Submission
            const subRes = await fetch(`/api/submissions?teamId=${teamId}`);
            if (subRes.ok) {
                const subData = await subRes.json();
                if (subData.submissions && subData.submissions.length > 0) {
                    setSubmission(subData.submissions[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = (code) => {
        if (code) {
            navigator.clipboard.writeText(code);
            setInviteCodeCopied(true);
            setTimeout(() => setInviteCodeCopied(false), 2000);
        }
    };

    const handleEditProject = () => {
        if (submission) {
            setProjectTitle(submission.title);
            setProjectDesc(submission.description);
            setRepoLink(submission.repoLink);
            setDemoLink(submission.demoLink || "");
            setIsEditing(true);
            setShowSubmitForm(true);
        }
    };

    const handleSubmitProject = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Backend POST handler handles both create and update based on presence of 'id' in body
            const method = "POST";
            const url = "/api/submissions";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: submission?._id, // Send ID just in case
                    event: team.event._id,
                    team: team._id,
                    title: projectTitle,
                    description: projectDesc,
                    repoLink,
                    demoLink
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmission(data.submission);
                setShowSubmitForm(false);
                setIsEditing(false);
                // Reset form
                setProjectTitle("");
                setProjectDesc("");
                setRepoLink("");
                setDemoLink("");
                // Re-fetch to be sure
                fetchTeamData();
            } else {
                alert(data.error || "Failed to submit project");
            }
        } catch (error) {
            console.error("Error submitting project:", error);
            alert("Failed to submit project");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-slate-800">Team not found</h1>
                <Link href="/participant" className="mt-4 text-blue-600 hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const isLeader = team.leader?._id === session?.user?.id;
    const isEventActive = new Date(team.event?.endDate) > new Date();

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/participant" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                {team.name}
                            </h1>
                            <p className="text-sm text-slate-500">
                                Event: <Link href={`/events/${team.event?._id}`} className="text-blue-600 hover:underline">{team.event?.title}</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - STATS & DETAILS */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* EVENT DETAILS CARD */}
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                Event Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Description</p>
                                    <p className="text-sm text-slate-700 mt-1 line-clamp-3">{team.event?.description}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Start Date</span>
                                        <span className="font-medium text-slate-900">{new Date(team.event?.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">End Date</span>
                                        <span className="font-medium text-slate-900">{new Date(team.event?.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-2">Tracks</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.event?.tracks?.map((track, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                {track}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* INVITE CODE */}
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Invite Code
                            </h2>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center gap-3">
                                <code className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                                    {team.inviteCode}
                                </code>
                                <button
                                    onClick={() => copyInviteCode(team.inviteCode)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-slate-700"
                                >
                                    {inviteCodeCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    {inviteCodeCopied ? "Copied!" : "Copy Code"}
                                </button>
                                <p className="text-xs text-slate-500 text-center">Share with teammates to verify membership.</p>
                            </div>
                        </section>

                        MEMBERS LIST
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px]">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 shrink-0">
                                <Users className="w-5 h-5 text-slate-500" />
                                Members ({(team.members?.length || 0) + (team.leader ? 1 : 0)})
                            </h2>
                            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {/* Leader */}
                                {team.leader && (
                                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 shadow-sm shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200 shrink-0">
                                            {team.leader.name?.charAt(0).toUpperCase() || "L"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {team.leader.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{team.leader.email}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1 shrink-0">
                                            <Trophy className="w-3 h-3" /> Leader
                                        </span>
                                    </div>
                                )}

                                {/* Members Grid */}
                                {team.members && team.members.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {team.members.map((member) => (
                                            <div key={member._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
                                                    {member.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">No other team members yet.</p>
                                        <p className="text-xs text-slate-400 mt-1">Share the invite code to grow your team!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN - PROJECT STATUS */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    Project Status
                                </h2>
                                {submission ? (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Submitted
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                                        Not Submitted
                                    </span>
                                )}
                            </div>

                            {submission && !showSubmitForm ? (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{submission.title}</h3>
                                            <p className="text-slate-600 mt-2 whitespace-pre-wrap">{submission.description}</p>
                                        </div>
                                        {isEventActive && (
                                            <button
                                                onClick={handleEditProject}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                            >
                                                <Edit className="w-4 h-4" /> Edit
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <a
                                            href={submission.repoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group"
                                        >
                                            <Github className="w-5 h-5 text-slate-700 group-hover:text-black" />
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-black">View Repository</span>
                                            <ExternalLink className="w-4 h-4 text-slate-400 ml-auto group-hover:text-slate-600" />
                                        </a>
                                        {submission.demoLink && (
                                            <a
                                                href={submission.demoLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group"
                                            >
                                                <ExternalLink className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-black">View Live Demo</span>
                                            </a>
                                        )}
                                    </div>
                                    {!isEventActive && (
                                        <p className="text-xs text-amber-600 italic mt-4 text-center">
                                            Submissions are closed for this event.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {!showSubmitForm ? (
                                        <div className="text-center py-10">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-900 font-medium mb-1">Ready to submit?</h3>
                                            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                                                Once your project is ready, submit your repository and details here. Only one submission per team is allowed.
                                            </p>
                                            {isEventActive ? (
                                                <button
                                                    onClick={() => setShowSubmitForm(true)}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                                >
                                                    Submit Project
                                                </button>
                                            ) : (
                                                <p className="text-rose-600 font-medium bg-rose-50 inline-block px-4 py-2 rounded-lg">
                                                    Event Ended - Submissions Closed
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitProject} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-slate-900">
                                                    {isEditing ? "Edit Submission" : "New Submission"}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowSubmitForm(false); setIsEditing(false); }}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div>
                                                <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Project Title <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    required
                                                    value={projectTitle}
                                                    onChange={(e) => setProjectTitle(e.target.value)}
                                                    placeholder="e.g. EcoTracker AI"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-gray-800 mb-1">
                                                    Description <span className="text-red-500">*</span>
                                                </Label>
                                                <textarea
                                                    required
                                                    value={projectDesc}
                                                    onChange={(e) => setProjectDesc(e.target.value)}
                                                    placeholder="Describe your project, tech stack, and features..."
                                                    rows={5}
                                                    className="w-full rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                    GitHub Repository <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    type="url"
                                                    required
                                                    value={repoLink}
                                                    onChange={(e) => setRepoLink(e.target.value)}
                                                    placeholder="https://github.com/..."
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Demo Link (Optional)
                                                </Label>
                                                <Input
                                                    type="url"
                                                    value={demoLink}
                                                    onChange={(e) => setDemoLink(e.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowSubmitForm(false); setIsEditing(false); }}
                                                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? "Saving..." : (isEditing ? "Update Project" : "Submit Project")}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
