'use client';

import { useState, useEffect } from "react";
import { Users, FileText, Calendar, Clock, ChevronRight, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MentorDashboard() {
    const [teams, setTeams] = useState([]);
    const [events, setEvents] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState({
        assignedTeams: 0,
        pendingSubmissions: 0,
        reviewedSubmissions: 0,
        upcomingEvents: 0,
        totalEvents: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMentorData();
    }, []);

    const fetchMentorData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const res = await fetch("/api/mentor");
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to fetch data");
            }
            
            const data = await res.json();
            
            if (data.success) {
                // Separate assigned teams from available teams
                const assigned = (data.teams || []).filter(t => t.assignedMentor);
                const available = (data.teams || []).filter(t => !t.assignedMentor && t.mentorRequested);
                
                setTeams({ assigned, available });
                setEvents(data.events || []);
                setSubmissions(data.submissions || []);
                setStats(data.stats || {
                    assignedTeams: 0,
                    pendingSubmissions: 0,
                    reviewedSubmissions: 0,
                    upcomingEvents: 0,
                    totalEvents: 0
                });
            }
        } catch (err) {
            console.error("Error fetching mentor data:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const claimTeam = async (teamId) => {
        try {
            const res = await fetch("/api/mentor/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId })
            });
            if (res.ok) {
                fetchMentorData(); // Refresh the data
            }
        } catch (err) {
            console.error("Error claiming team:", err);
        }
    };

    const getStatusColor = (eventStatus) => {
        switch (eventStatus) {
            case "ongoing":
                return "bg-emerald-100 text-emerald-700";
            case "upcoming":
                return "bg-blue-100 text-blue-700";
            case "completed":
                return "bg-slate-100 text-slate-700";
            default:
                return "bg-amber-100 text-amber-700";
        }
    };

    const getTeamMemberCount = (team) => {
        if (!team) return 0;
        const leaderCount = team.leader ? 1 : 0;
        const membersCount = team.members ? team.members.length : 0;
        return leaderCount + membersCount;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "TBD";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Dashboard</h2>
                    <p className="text-slate-500 mb-4">{error}</p>
                    <button
                        onClick={fetchMentorData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
                            <p className="mt-2 text-indigo-100 text-lg">
                                {stats.assignedTeams > 0 
                                    ? `You are mentoring ${stats.assignedTeams} team${stats.assignedTeams !== 1 ? 's' : ''} across ${stats.totalEvents} event${stats.totalEvents !== 1 ? 's' : ''}`
                                    : "No teams assigned yet. Join an event as a mentor to get started."
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {stats.upcomingEvents > 0 && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                                    <p className="text-indigo-200 text-sm">Active Events</p>
                                    <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Assigned Teams</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.assignedTeams}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Pending Reviews</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingSubmissions}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Reviewed</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.reviewedSubmissions}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Active Events</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.upcomingEvents}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Teams Section */}
                    <div className="lg:col-span-2">
                        {/* Available Teams to Claim */}
                        {teams.available && teams.available.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50">
                                    <h3 className="text-lg font-semibold text-slate-900">Teams Needing Mentors</h3>
                                    <span className="text-sm text-slate-500">{teams.available.length} available</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {teams.available.map((team) => (
                                        <div key={team._id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-semibold text-slate-900">{team.name || "Unnamed Team"}</h4>
                                                        {team.event && (
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(team.event.status)}`}>
                                                                {team.event.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {team.event?.title || "No event assigned"}
                                                    </p>
                                                    <p className="text-sm text-amber-600 mt-1">
                                                        {team.mentorRequestMessage || "Requested mentor help"}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {getTeamMemberCount(team)} member{getTeamMemberCount(team) !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => claimTeam(team._id)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                                >
                                                    Claim Team
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Assigned Teams */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">Your Assigned Teams</h3>
                                <span className="text-sm text-slate-500">{teams.assigned?.length || 0} team{(teams.assigned?.length || 0) !== 1 ? 's' : ''}</span>
                            </div>

                            {(!teams.assigned || teams.assigned.length === 0) ? (
                                <div className="p-8 text-center">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 mb-2">No teams assigned yet.</p>
                                    <p className="text-sm text-slate-400">Claim teams above that need mentors.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {teams.assigned.map((team) => (
                                        <div key={team._id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-semibold text-slate-900">{team.name || "Unnamed Team"}</h4>
                                                        {team.event && (
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(team.event.status)}`}>
                                                                {team.event.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {team.event?.title || "No event assigned"}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {getTeamMemberCount(team)} member{getTeamMemberCount(team) !== 1 ? 's' : ''}
                                                        </span>
                                                        {team.event?.startDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {formatDate(team.event.startDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {team.hasSubmission ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-full">
                                                            <FileText className="w-4 h-4" />
                                                            Submitted
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-amber-700 bg-amber-50 rounded-full">
                                                            <Clock className="w-4 h-4" />
                                                            Awaiting
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                                <Link
                                                    href={`/participant/teams/${team._id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    View Team
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                                
                                                {team.event && (
                                                    <Link
                                                        href={`/events/${team.event._id}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                        Event Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Submissions */}
                        {submissions.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900">Recent Submissions</h3>
                                    <span className="text-sm text-slate-500">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {submissions.map((submission) => (
                                        <div key={submission._id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{submission.title}</h4>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {submission.team?.name} • {submission.event?.title}
                                                    </p>
                                                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{submission.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {submission.repoLink && (
                                                        <a
                                                            href={submission.repoLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Repository
                                                        </a>
                                                    )}
                                                    {submission.demoLink && (
                                                        <a
                                                            href={submission.demoLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Demo
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Events Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Events</h3>
                            {events.length === 0 ? (
                                <p className="text-slate-500 text-sm">No events assigned.</p>
                            ) : (
                                <div className="space-y-4">
                                    {events.slice(0, 5).map((event) => (
                                        <div key={event._id} className="pb-4 border-b border-slate-100 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-slate-900 text-sm">{event.title}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link 
                                    href="/events"
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Browse Events</p>
                                        <p className="text-sm text-slate-500">Find events to mentor</p>
                                    </div>
                                </Link>
                                
                                {stats.pendingSubmissions > 0 && (
                                    <div className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group">
                                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                            <FileText className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Review Submissions</p>
                                            <p className="text-sm text-slate-500">{stats.pendingSubmissions} pending</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
