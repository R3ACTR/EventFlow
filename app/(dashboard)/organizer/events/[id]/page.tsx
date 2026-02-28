"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    ArrowLeft,
    Settings,
    Users,
    Calendar,
    Trophy,
    MessageSquare,
    Edit,
    Trash2,
    Check,
    Globe,
    Lock,
    Search,
    Gavel,
    Clock,
 import {                                                                                         
      ArrowLeft,                                                                                   
      Settings,                                                                                    
      Users,                                                                                       
      Calendar,                                                                                    
      Trophy,                                                                                      
      MessageSquare,                                                                               
      Edit,                                                                                        
      Trash2,                                                                                      
      Check,                                                                                       
      X,                                                                                           
      Search,                                                                                      
      Gavel,                                                                                       
      Clock,                                                                                       
      Globe                                                                                        
  } from "lucide-react";
             
} from "lucide-react";
import AssignJudgesModal from "@/components/dashboards/organizer/AssignJudgesModal";
import CertificateDesigner from "@/components/dashboards/organizer/CertificateDesigner";
import ParticipantList from "@/components/dashboards/organizer/ParticipantList";

export default function EventDashboard() {
    const params = useParams(); // useParams returns a readonly object, not a Promise in Client Components
    const { id } = params;
    const { data: session } = useSession();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [showJudgeModal, setShowJudgeModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get("tab");
        if (tab && ["overview", "teams", "judges", "certificates"].includes(tab)) {
            setActiveTab(tab);
        }
    }, []);
    const [judges, setJudges] = useState([]);
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);

    useEffect(() => {
        if (event && activeTab === "judges") {
            fetchAssignedJudges();
        } else if (event && activeTab === "teams") {
            fetchTeams();
        }
    }, [event, activeTab]);

    const fetchTeams = async () => {
        setTeamsLoading(true);
        try {
            const res = await fetch(`/api/events/${id}/teams`);
            if (res.ok) {
                const data = await res.json();
                setTeams(data.teams || []);
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setTeamsLoading(false);
        }
    };

    const fetchAssignedJudges = async () => {
        try {
            const res = await fetch(`/api/events/${id}/judges`);
            if (res.ok) {
                const data = await res.json();
                setJudges(data.judges || []);
            }
        } catch (error) {
            console.error("Error fetching judges:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            // In a real app, you'd have a specific GET /api/events/[id] endpoint
            // For now, we reuse the list endpoint or you should create a specific one
            // But let's assume valid data for now, implementing the fetch logic
            const res = await fetch(`/api/events/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data.event);
            } else {
                // Handle error
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            const url = `${window.location.origin}/events/${id}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const handleToggleVisibility = async () => {
        if (!event) return;
        try {
            const newVisibility = !event.isPublic;
            // Optimistic UI update
            setEvent({ ...event, isPublic: newVisibility });
            
            const res = await fetch(`/api/events/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: newVisibility })
            });
            
            if (!res.ok) {
                throw new Error("Failed to update visibility");
            }
        } catch (err) {
            console.error(err);
            // Revert optimistic update on failure
            setEvent({ ...event, isPublic: !event.isPublic });
            alert("Failed to update visibility");
        }
    };

    const handleDuplicate = async () => {
        if (!event) return;
        try {
            setIsDuplicating(true);
            const payload = {
                title: `${event.title} (Copy)`,
                description: event.description || "",
                startDate: event.startDate,
                endDate: event.endDate,
                registrationDeadline: event.registrationDeadline,
                location: event.location,
                minTeamSize: event.minTeamSize,
                maxTeamSize: event.maxTeamSize,
                tracks: event.tracks || [],
                rules: event.rules || [],
                judges: event.judges || [],
                mentors: event.mentors || [],
                isPublic: false
            };
            
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error("Failed to duplicate event");
            const newEvent = await res.json();
            router.push(`/organizer/events/${newEvent._id}/edit`);
        } catch (err) {
            console.error(err);
            alert("Failed to duplicate event");
            setIsDuplicating(false);
        }
    };

    const handleCopyTeamCode = async (teamId: string, code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedTeamId(teamId);
            setTimeout(() => setCopiedTeamId(null), 2000);
        } catch (err) {
            console.error("Failed to copy team code:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Event Not Found</h2>
                <Link href="/organizer" className="text-indigo-600 hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/organizer"
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{event.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize`}>
                                        {event.status}
                                    </span>
                                    <button
                                        onClick={handleToggleVisibility}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${event.isPublic ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                        title={`Click to make ${event.isPublic ? 'Private' : 'Public'}`}
                                    >
                                        {event.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        {event.isPublic ? 'Public' : 'Private'}
                                    </button>
                                    <span>•</span>
                                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="text-red-600 font-medium">Register by: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : "N/A"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                            <button
                                onClick={handleDuplicate}
                                disabled={isDuplicating}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors disabled:opacity-50"
                            >
                                <CopyPlus className="w-4 h-4" />
                                {isDuplicating ? "Duplicating..." : "Duplicate"}
                            </button>
                            <Link href={`/organizer/events/${id}/edit`} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                                <Edit className="w-4 h-4" />
                                Edit Event
                            </Link>
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mt-4">
                        {["overview", "teams", "judges", "certificates"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                id={`event-tab-${tab}`}
                                role="tab"
                                aria-selected={activeTab === tab}
                                aria-controls={`event-tabpanel-${tab}`}
                                tabIndex={activeTab === tab ? 0 : -1}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "overview" && (
                    <div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        role="tabpanel"
                        id="event-tabpanel-overview"
                        aria-labelledby="event-tab-overview"
                    >
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Timeline */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Event Timeline
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-slate-500 mb-1">Start Date</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {new Date(event.startDate).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-slate-500 mb-1">End Date</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {new Date(event.endDate).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-slate-500 mb-1">Registration Deadline</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleString() : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Teams</p>
                                    <p className="text-2xl font-bold text-slate-900">0</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Participants</p>
                                    <p className="text-2xl font-bold text-slate-900">0</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Submissions</p>
                                    <p className="text-2xl font-bold text-slate-900">0</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">About Event</h3>
                                <p className="text-black whitespace-pre-line">{event.description}</p>
                            </div>

                            {/* Tracks */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Tracks</h3>
                                <div className="flex flex-wrap gap-2">
                                    {event.tracks?.length > 0 ? (
                                        event.tracks.map((track, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                                {track}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 italic">No tracks defined.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Rules */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Rules</h3>
                                <ul className="space-y-2">
                                    {event.rules?.length > 0 ? (
                                        event.rules.map((rule, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                {rule}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 italic">No rules defined.</p>
                                    )}
                                </ul>
                            </div>

                            {/* Team Limits */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Constraints</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Min Team Size</span>
                                        <span className="font-semibold text-blue-600">{event.minTeamSize}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Max Team Size</span>
                                        <span className="font-semibold text-blue-600">{event.maxTeamSize}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Domain */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                    Custom Domain
                                </h3>
                                {event.customDomain ? (
                                    <a
                                        href={`https://${event.customDomain}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-600 hover:underline break-all"
                                    >
                                        {event.customDomain}
                                    </a>
                                ) : (
                                    <p className="text-slate-500 italic">No custom domain mapped.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "judges" && (
                    <div
                        className="space-y-6"
                        role="tabpanel"
                        id="event-tabpanel-judges"
                        aria-labelledby="event-tab-judges"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Assigned Judges</h2>
                            <button
                                onClick={() => setShowJudgeModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                            >
                                <Gavel className="w-4 h-4" />
                                Assign Judge
                            </button>
                        </div>

                        {judges.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gavel className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No Judges Assigned</h3>
                                <p className="text-slate-500 mb-6">Assign judges to evaluate submissions for this event.</p>
                                <button
                                    onClick={() => setShowJudgeModal(true)}
                                    className="text-indigo-600 font-medium hover:underline"
                                >
                                    Assign a Judge
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {judges.map((judge) => (
                                    <div key={judge._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                            {judge.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{judge.name}</h4>
                                            <p className="text-sm text-slate-500">{judge.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "teams" && (
                    <div
                        className="space-y-6"
                        role="tabpanel"
                        id="event-tabpanel-teams"
                        aria-labelledby="event-tab-teams"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Participating Teams</h2>
                        </div>

                        {teamsLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No Teams Yet</h3>
                                <p className="text-slate-500">Teams will appear here once they join the event.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams.map((team) => (
                                    <div key={team._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                                        {/* Status Badge */}
                                        <span className={`absolute top-4 right-4 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${team.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                            team.status === 'disqualified' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {team.status || 'Active'}
                                        </span>

                                        <div className="flex items-center gap-4 mb-6 pr-16">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                                                {team.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 line-clamp-1">{team.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-slate-500">Code: <span className="font-mono">{team.inviteCode}</span></p>
                                                    <button
                                                        onClick={() => handleCopyTeamCode(team._id, team.inviteCode)}
                                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                                        title="Copy Code"
                                                    >
                                                        {copiedTeamId === team._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    <ParticipantList team={team} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}

                {activeTab === "certificates" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Certificate Designer</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <CertificateDesigner event={event} onSave={fetchEventDetails} />
                        </div>
                    </div>
                )}

                {showJudgeModal && (
                    <AssignJudgesModal
                        event={event}
                        onClose={() => {
                            setShowJudgeModal(false);
                            fetchAssignedJudges(); // Refresh list on close
                        }}
                    />
                )}
            </div>
        </div>
    );
}
