'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Plus,
    Calendar,
    Users,
    Clock,
    MoreVertical,
    Edit,
    Trash,
    Settings,
    ChevronRight,
    BarChart,
    Gavel // Added icon for judges
} from "lucide-react";
import AssignJudgesModal from "@/components/dashboards/organizer/AssignJudgesModal";

export default function OrganizerDashboard() {
    const { data: session } = useSession();
    const user = session?.user;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showJudgeModal, setShowJudgeModal] = useState(false);
    const [stats, setStats] = useState({
        totalParticipants: 0,
        totalTeams: 0,
        totalSubmissions: 0,
        avgTeamSize: 0
    });

    useEffect(() => {
        if (session?.user?.role === 'organizer') {
            fetchMyEvents();
            fetchStats();
        }
    }, [session]);

    const fetchMyEvents = async () => {
        try {
            const res = await fetch("/api/events?view=mine");
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/organizer/stats");
            if (res.ok) {
                const data = await res.json();
                setStats({
                    totalParticipants: data.totalParticipants || 0,
                    totalTeams: data.totalTeams || 0,
                    totalSubmissions: data.totalSubmissions || 0,
                    avgTeamSize: data.avgTeamSize || 0
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const statusColors = {
        draft: "bg-slate-100 text-slate-700",
        upcoming: "bg-blue-100 text-blue-700",
        ongoing: "bg-emerald-100 text-emerald-700",
        completed: "bg-purple-100 text-purple-700",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Premium Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Welcome back, {user?.name || "Organizer"}!
                            </h1>
                            <p className="mt-2 text-indigo-100 text-lg">
                                Manage your hackathons, track participants, and oversee submissions.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/organizer/events/create"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5" />
                                Create New Event
                            </Link>
                            <Link
                                href="/profile"
                                className="p-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-xl transition-all backdrop-blur-sm"
                            >
                                <Users className="w-6 h-6 text-white" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt- py-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-500">Total Events</p>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{events.length}</p>
                        <p className="text-xs text-slate-400 mt-1">All time created</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-500">Participants</p>
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.totalParticipants}</p>
                        <p className="text-xs text-slate-400 mt-1">Across all events</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-500">Upcoming</p>
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            {events.filter(e => e.status === 'upcoming').length}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Scheduled events</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-500">Avg. Team Size</p>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.avgTeamSize}</p>
                        <p className="text-xs text-slate-400 mt-1">Members per team</p>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Your Events</h2>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                            View All
                        </button>
                    </div>

                    {events.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No events created yet</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Get started by creating your first hackathon and inviting participants.</p>
                            <Link
                                href="/organizer/events/create"
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create Event
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {events.map((event) => (
                                <div key={event._id} className="p-6 hover:bg-slate-50 transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize tracking-wide ${statusColors[event.status] || statusColors.draft}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4 line-clamp-1 max-w-2xl">{event.description}</p>
                                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span>{event.maxTeamSize} max members</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <span>48h Duration</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">

                                            <Link
                                                href={`/organizer/events/${event._id}`}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-indigo-300 text-sm font-medium transition-all shadow-sm"
                                            >
                                                Manage
                                            </Link>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {
                    showJudgeModal && selectedEvent && (
                        <AssignJudgesModal
                            event={selectedEvent}
                            onClose={() => {
                                setShowJudgeModal(false);
                                setSelectedEvent(null);
                            }}
                        />
                    )
                }
            </div>
        </div >
    );
}
