'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input, Label } from "@/components/ui/form";
import { ArrowLeft, Plus, X, Clock, MapPin, User, Trash2 } from "lucide-react";
import Link from "next/link";
import useFocusTrap from "@/components/common/useFocusTrap";
import { handleFormKeyDown } from "@/components/common/keyboardNavigation";

export default function CreateEventPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [trackInput, setTrackInput] = useState("");
    const [schedule, setSchedule] = useState([]);
    const [scheduleItem, setScheduleItem] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "other",
        speakerName: "",
        speakerBio: ""
    });
    const [error, setError] = useState("");

    const formRef = useRef(null);
    const titleInputRef = useRef(null);

    // Focus trap for the form
    useFocusTrap({
        isOpen: true,
        containerRef: formRef,
        onClose: () => {},
        initialFocusRef: titleInputRef,
    });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        location: "",
        minTeamSize: 2,
        maxTeamSize: 4,
        rules: "",
        isPublic: true
    });

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

    const handleAddScheduleItem = (e) => {
        e.preventDefault();
        if (!scheduleItem.title || !scheduleItem.startTime || !scheduleItem.endTime) {
            setError("Title, start time, and end time are required for schedule items");
            return;
        }
        setSchedule([...schedule, {
            ...scheduleItem,
            speaker: scheduleItem.speakerName ? { name: scheduleItem.speakerName, bio: scheduleItem.speakerBio, avatar: "" } : { name: "", bio: "", avatar: "" }
        }]);
        setScheduleItem({
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            location: "",
            type: "other",
            speakerName: "",
            speakerBio: ""
        });
        setError("");
    };

    const handleRemoveScheduleItem = (index) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    tracks,
                    schedule,
                    rules: formData.rules.split("\n").filter(r => r.trim())
                })
            });

            if (res.ok) {
                router.push("/organizer");
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            setError("Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    // Handle form keyboard navigation
    const handleFormKeyDownEvent = (e) => {
        handleFormKeyDown(e, {
            onSubmit: handleSubmit,
            onCancel: () => {
                // Clear form on Escape
                setFormData({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    registrationDeadline: "",
                    location: "",
                    minTeamSize: 2,
                    maxTeamSize: 4,
                    rules: "",
                    isPublic: true
                });
                setTracks([]);
            },
            submitKey: 'Enter',
        });
    };

    return (
        <div className="min-h-screen bg-slate-200 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/organizer"
                        className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label="Back to organizer dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
                        <p className="text-slate-500 mt-1">Configure your hackathon, rules, and tracks</p>
                    </div>
                </div>

                <form 
                    ref={formRef}
                    onSubmit={handleSubmit} 
                    onKeyDown={handleFormKeyDownEvent}
                    className="space-y-8"
                    role="form"
                    aria-label="Create new event"
                >
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
                                    ref={titleInputRef}
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                    placeholder="e.g. AI Innovation Hackathon 2024"
                                    className="h-12 text-lg"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></Label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    required
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
                            <div className="md:col-span-2">
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Location</Label>
                                <Input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Virtual, San Francisco, CA, London, UK"
                                    className="h-11"
                                />
                                <p className="text-xs text-slate-400 mt-1">Where the event will take place (leave empty for virtual events).</p>
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
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

                    {/* Schedule */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">6</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Event Schedule</h2>
                                <p className="text-sm text-slate-500">Plan your event timeline with sessions, workshops, and breaks</p>
                            </div>
                        </div>

                        {/* Add Schedule Item Form */}
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="font-semibold text-slate-800">Add New Session</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Session Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={scheduleItem.title}
                                        onChange={(e) => setScheduleItem({...scheduleItem, title: e.target.value})}
                                        placeholder="e.g., Opening Keynote"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Type</Label>
                                    <select
                                        value={scheduleItem.type}
                                        onChange={(e) => setScheduleItem({...scheduleItem, type: e.target.value})}
                                        className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    >
                                        <option value="keynote">Keynote</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="break">Break</option>
                                        <option value="networking">Networking</option>
                                        <option value="presentation">Presentation</option>
                                        <option value="competition">Competition</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Location</Label>
                                    <Input
                                        value={scheduleItem.location}
                                        onChange={(e) => setScheduleItem({...scheduleItem, location: e.target.value})}
                                        placeholder="e.g., Main Hall, Room A"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Start Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={scheduleItem.startTime}
                                        onChange={(e) => setScheduleItem({...scheduleItem, startTime: e.target.value})}
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">End Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={scheduleItem.endTime}
                                        onChange={(e) => setScheduleItem({...scheduleItem, endTime: e.target.value})}
                                        className="h-11"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Description</Label>
                                    <textarea
                                        value={scheduleItem.description}
                                        onChange={(e) => setScheduleItem({...scheduleItem, description: e.target.value})}
                                        rows={2}
                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                        placeholder="Brief description of the session..."
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Speaker Name</Label>
                                    <Input
                                        value={scheduleItem.speakerName}
                                        onChange={(e) => setScheduleItem({...scheduleItem, speakerName: e.target.value})}
                                        placeholder="e.g., John Doe"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Speaker Bio</Label>
                                    <Input
                                        value={scheduleItem.speakerBio}
                                        onChange={(e) => setScheduleItem({...scheduleItem, speakerBio: e.target.value})}
                                        placeholder="Brief speaker bio"
                                        className="h-11"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddScheduleItem}
                                className="w-full mt-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add to Schedule
                            </button>
                        </div>

                        {/* Schedule List */}
                        {schedule.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No sessions added yet. Add your first session above.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {schedule.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                            item.type === 'keynote' ? 'bg-purple-100 text-purple-600' :
                                            item.type === 'workshop' ? 'bg-blue-100 text-blue-600' :
                                            item.type === 'break' ? 'bg-amber-100 text-amber-600' :
                                            item.type === 'networking' ? 'bg-green-100 text-green-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {item.type === 'keynote' && <User className="w-6 h-6" />}
                                            {item.type === 'workshop' && <Clock className="w-6 h-6" />}
                                            {item.type === 'break' && <span className="text-lg">☕</span>}
                                            {item.type === 'networking' && <User className="w-6 h-6" />}
                                            {item.type === 'other' && <Clock className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                    item.type === 'keynote' ? 'bg-purple-100 text-purple-700' :
                                                    item.type === 'workshop' ? 'bg-blue-100 text-blue-700' :
                                                    item.type === 'break' ? 'bg-amber-100 text-amber-700' :
                                                    item.type === 'networking' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                            {item.location && (
                                                <p className="text-sm text-slate-500">
                                                    <MapPin className="w-4 h-4 inline mr-1" />
                                                    {item.location}
                                                </p>
                                            )}
                                            {item.speaker?.name && (
                                                <p className="text-sm text-indigo-600 mt-1">
                                                    <User className="w-4 h-4 inline mr-1" />
                                                    {item.speaker.name}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveScheduleItem(index)}
                                            className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div 
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 pb-12">
                        <Link
                            href="/organizer"
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Event...
                                </>
                            ) : (
                                "Create Event"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
