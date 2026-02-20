"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Clock, Check } from "lucide-react";

export default function EventDetailsPage() {
    const params = useParams();
    const { id } = params;

    const [pageId, setPageId] = useState(null);

    useEffect(() => {
        if (id) {
            setPageId(id);
        }
    }, [id]);

    const { data: session } = useSession();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pageId) {
            fetchEventDetails();
        }
    }, [pageId]);

    const fetchEventDetails = async () => {
        try {
            const res = await fetch(`/api/events/${pageId}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data.event);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
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
                <Link href="/participant" className="text-indigo-600 hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/participant"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <div className="px-8 py-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(event.startDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        {event.minTeamSize}-{event.maxTeamSize} Members
                                    </span>
                                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium capitalize">
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                            {/* In the future, Apply button can logic specifically here too */}
                        </div>

                        <div className="prose prose-slate max-w-none mt-8">
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">About the Event</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>

                            <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Rules</h3>
                            <ul className="space-y-2">
                                {event.rules?.map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600">
                                        <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span>{rule}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Tracks</h3>
                            <div className="flex flex-wrap gap-2">
                                {event.tracks?.map((track, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                        {track}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
