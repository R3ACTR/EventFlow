"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input, Label } from "@/components/ui/form";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
    const params = useParams(); // returns a readonly object
    const { id } = params;
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [trackInput, setTrackInput] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        minTeamSize: 2,
        maxTeamSize: 4,
        rules: "",
        isPublic: true
    });

    useEffect(() => {
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                const event = data.event;

                // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
                const formatDate = (dateString) => {
                    if (!dateString) return "";
                    return new Date(dateString).toISOString().slice(0, 16);
                };

                setFormData({
                    title: event.title,
                    description: event.description,
                    startDate: formatDate(event.startDate),
                    endDate: formatDate(event.endDate),
                    registrationDeadline: formatDate(event.registrationDeadline),
                    minTeamSize: event.minTeamSize,
                    maxTeamSize: event.maxTeamSize,
                    rules: event.rules?.join("\n") || "",
                    isPublic: event.isPublic
                });
                setTracks(event.tracks || []);
            } else {
                router.push("/organizer");
            }
        } catch (error) {
            console.error("Error fetching event:", error);
            router.push("/organizer");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleAddTrack = (e) => {
        e.preventDefault();
        if (trackInput.trim()) {
            setTracks([...tracks, trackInput.trim()]);
            setTrackInput("");
        }
    };

    const handleRemoveTrack = (index) => {
        setTracks(tracks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    tracks,
                    rules: formData.rules.split("\n").filter(r => r.trim())
                })
            });

            if (res.ok) {
                router.push(`/organizer/events/${id}`);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to update event");
            }
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Failed to update event");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-200 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href={`/organizer/events/${id}`}
                        className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
                        <p className="text-slate-500 mt-1">Update your hackathon details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">1</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Basic Details</h2>
                                <p className="text-sm text-slate-500">Define the core identity of your event</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Event Title <span className="text-red-500">*</span></Label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. AI Innovation Hackathon 2024"
                                    className="h-12 text-lg"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Description</Label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-black"
                                    placeholder="Describe the goal and theme of your event..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">2</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Logistics</h2>
                                <p className="text-sm text-slate-500">Set the timeline for your event</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Start Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">End Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Registration Deadline <span className="text-red-500">*</span></Label>
                                <Input
                                    type="datetime-local"
                                    name="registrationDeadline"
                                    value={formData.registrationDeadline}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                                <p className="text-xs text-slate-400 mt-1">Participants must register before this date.</p>
                            </div>
                        </div>
                    </div>

                    {/* Team Settings */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">3</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Participation</h2>
                                <p className="text-sm text-slate-500">Set limits for team composition</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Min Members</Label>
                                <Input
                                    type="number"
                                    name="minTeamSize"
                                    value={formData.minTeamSize}
                                    onChange={handleChange}
                                    min={1}
                                    className="h-11"
                                />
                                <p className="text-xs text-slate-400 mt-1">Minimum participants required per team</p>
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Max Members</Label>
                                <Input
                                    type="number"
                                    name="maxTeamSize"
                                    value={formData.maxTeamSize}
                                    onChange={handleChange}
                                    min={1}
                                    className="h-11"
                                />
                                <p className="text-xs text-slate-400 mt-1">Maximum limit for team size</p>
                            </div>
                        </div>
                    </div>

                    {/* Tracks & Themes */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">4</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Tracks & Themes</h2>
                                <p className="text-sm text-slate-500">Categorize projects (e.g., Healthcare, EdTech)</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex gap-3 mb-4">
                                <Input
                                    value={trackInput}
                                    onChange={(e) => setTrackInput(e.target.value)}
                                    placeholder="Add a track name..."
                                    className="flex-1 h-11"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTrack(e)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTrack}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Track
                                </button>
                            </div>

                            {tracks.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-500">No tracks added yet. Add one above.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {tracks.map((track, index) => (
                                        <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                            {track}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTrack(index)}
                                                className="hover:text-red-500 p-0.5 rounded-full hover:bg-white/50 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">5</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Rules & Guidelines</h2>
                                <p className="text-sm text-slate-500">Set the boundaries for participants</p>
                            </div>
                        </div>

                        <div>
                            <textarea
                                name="rules"
                                value={formData.rules}
                                onChange={handleChange}
                                rows={6}
                                className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-mono text-slate-600 bg-slate-50"
                                placeholder={"1. No cross-team collaboration\n2. All code must be written during the event\n3. Respect the code of conduct"}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 pb-12">
                        <Link
                            href={`/organizer/events/${id}`}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all shadow-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating Event...
                                </>
                            ) : (
                                "Update Event"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
