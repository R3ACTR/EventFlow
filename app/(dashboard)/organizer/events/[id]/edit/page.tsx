"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input, Label } from "@/components/ui/form";
import { ArrowLeft, Plus, X, HelpCircle, Clock, MapPin, User, Trash2 } from "lucide-react";
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
    const [faqs, setFaqs] = useState([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "general" });
    const [schedule, setSchedule] = useState([]);
    const [newScheduleItem, setNewScheduleItem] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "other",
        speakerName: "",
        speakerBio: ""
    });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        minTeamSize: 2,
        maxTeamSize: 4,
        rules: "",
        isPublic: true,
        customDomain: ""
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
                    isPublic: event.isPublic,
                    customDomain: event.customDomain || ""
                });
                setTracks(event.tracks || []);
                setFaqs(event.faqs || []);
                setSchedule(event.schedule || []);
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

    const handleAddFaq = async () => {
        if (!newFaq.question.trim() || !newFaq.answer.trim()) {
            alert("Please fill in both question and answer");
            return;
        }

        try {
            const res = await fetch(`/api/events/${id}/faqs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newFaq)
            });

            if (res.ok) {
                const data = await res.json();
                setFaqs(data.faqs || []);
                setNewFaq({ question: "", answer: "", category: "general" });
            } else {
                const error = await res.json();
                alert(error.error || "Failed to add FAQ");
            }
        } catch (error) {
            console.error("Error adding FAQ:", error);
            alert("Failed to add FAQ");
        }
    };

    const handleDeleteFaq = async (index) => {
        try {
            const res = await fetch(`/api/events/${id}/faqs?index=${index}`, {
                method: "DELETE"
            });

            if (res.ok) {
                const data = await res.json();
                setFaqs(data.faqs || []);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to delete FAQ");
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            alert("Failed to delete FAQ");
        }
    };

    const handleAddScheduleItem = async () => {
        if (!newScheduleItem.title || !newScheduleItem.startTime || !newScheduleItem.endTime) {
            alert("Title, start time, and end time are required");
            return;
        }

        try {
            const res = await fetch(`/api/events/${id}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newScheduleItem.title,
                    description: newScheduleItem.description,
                    startTime: newScheduleItem.startTime,
                    endTime: newScheduleItem.endTime,
                    location: newScheduleItem.location,
                    type: newScheduleItem.type,
                    speaker: newScheduleItem.speakerName ? { name: newScheduleItem.speakerName, bio: newScheduleItem.speakerBio, avatar: "" } : { name: "", bio: "", avatar: "" }
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Fetch updated schedule
                const eventRes = await fetch(`/api/events/${id}`);
                if (eventRes.ok) {
                    const eventData = await eventRes.json();
                    setSchedule(eventData.event.schedule || []);
                }
                setNewScheduleItem({
                    title: "",
                    description: "",
                    startTime: "",
                    endTime: "",
                    location: "",
                    type: "other",
                    speakerName: "",
                    speakerBio: ""
                });
            } else {
                const error = await res.json();
                alert(error.error || "Failed to add schedule item");
            }
        } catch (error) {
            console.error("Error adding schedule item:", error);
            alert("Failed to add schedule item");
        }
    };

    const handleDeleteScheduleItem = async (itemId) => {
        try {
            const res = await fetch(`/api/events/${id}/schedule?itemId=${itemId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                // Fetch updated schedule
                const eventRes = await fetch(`/api/events/${id}`);
                if (eventRes.ok) {
                    const eventData = await eventRes.json();
                    setSchedule(eventData.event.schedule || []);
                }
            } else {
                const error = await res.json();
                alert(error.error || "Failed to delete schedule item");
            }
        } catch (error) {
            console.error("Error deleting schedule item:", error);
            alert("Failed to delete schedule item");
        }
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
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Custom Domain</Label>
                                <Input
                                    name="customDomain"
                                    value={formData.customDomain}
                                    onChange={handleChange}
                                    placeholder="event.yourdomain.com"
                                    className="h-12"
                                />
                                <p className="text-xs text-slate-400 mt-1">Optional. Leave empty to remove domain mapping.</p>
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

                    {/* FAQs */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <HelpCircle className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">FAQ Section</h2>
                                <p className="text-sm text-slate-500">Add frequently asked questions for participants</p>
                            </div>
                        </div>

                        {/* Add new FAQ form */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="font-semibold text-slate-800">Add New FAQ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Question</Label>
                                    <Input
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                        placeholder="e.g., What is the maximum team size?"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Category</Label>
                                    <select
                                        value={newFaq.category}
                                        onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                                        className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="general">General</option>
                                        <option value="registration">Registration</option>
                                        <option value="submission">Submission</option>
                                        <option value="judging">Judging</option>
                                        <option value="prizes">Prizes</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={handleAddFaq}
                                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add FAQ
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-semibold text-slate-700">Answer</Label>
                                <textarea
                                    value={newFaq.answer}
                                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                    rows={2}
                                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                    placeholder="Provide the answer to this question..."
                                />
                            </div>
                        </div>

                        {/* FAQ List */}
                        {faqs.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No FAQs added yet. Add your first FAQ above.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full capitalize">
                                                    {faq.category}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-slate-900 mb-1">{faq.question}</h4>
                                            <p className="text-sm text-slate-600">{faq.answer}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteFaq(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Event Schedule</h2>
                                <p className="text-sm text-slate-500">Plan your event timeline with sessions, workshops, and breaks</p>
                            </div>
                        </div>

                        {/* Add new schedule item form */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="font-semibold text-slate-800">Add New Session</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Session Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={newScheduleItem.title}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, title: e.target.value})}
                                        placeholder="e.g., Opening Keynote"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Type</Label>
                                    <select
                                        value={newScheduleItem.type}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, type: e.target.value})}
                                        className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                                        value={newScheduleItem.location}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, location: e.target.value})}
                                        placeholder="e.g., Main Hall"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Start Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={newScheduleItem.startTime}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, startTime: e.target.value})}
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">End Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={newScheduleItem.endTime}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, endTime: e.target.value})}
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Speaker Name</Label>
                                    <Input
                                        value={newScheduleItem.speakerName}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, speakerName: e.target.value})}
                                        placeholder="e.g., John Doe"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Speaker Bio</Label>
                                    <Input
                                        value={newScheduleItem.speakerBio}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, speakerBio: e.target.value})}
                                        placeholder="Brief speaker bio"
                                        className="h-11"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Description</Label>
                                    <textarea
                                        value={newScheduleItem.description}
                                        onChange={(e) => setNewScheduleItem({...newScheduleItem, description: e.target.value})}
                                        rows={2}
                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                        placeholder="Brief description of the session..."
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddScheduleItem}
                                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
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
                                {[...schedule].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((item) => (
                                    <div key={item._id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                            item.type === 'keynote' ? 'bg-purple-100 text-purple-600' :
                                            item.type === 'workshop' ? 'bg-blue-100 text-blue-600' :
                                            item.type === 'break' ? 'bg-amber-100 text-amber-600' :
                                            item.type === 'networking' ? 'bg-green-100 text-green-600' :
                                            'bg-indigo-100 text-indigo-600'
                                        }`}>
                                            {item.type === 'keynote' && <User className="w-6 h-6" />}
                                            {item.type === 'workshop' && <Clock className="w-6 h-6" />}
                                            {item.type === 'break' && <span className="text-lg">☕</span>}
                                            {item.type === 'networking' && <User className="w-6 h-6" />}
                                            {item.type === 'presentation' && <Clock className="w-6 h-6" />}
                                            {item.type === 'competition' && <span className="text-lg">🏆</span>}
                                            {item.type === 'other' && <Clock className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                                                    item.type === 'keynote' ? 'bg-purple-100 text-purple-700' :
                                                    item.type === 'workshop' ? 'bg-blue-100 text-blue-700' :
                                                    item.type === 'break' ? 'bg-amber-100 text-amber-700' :
                                                    item.type === 'networking' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                                {new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                            {item.location && (
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {item.location}
                                                </p>
                                            )}
                                            {item.description && (
                                                <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                                            )}
                                            {item.speaker?.name && (
                                                <p className="text-sm text-indigo-600 mt-2 flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {item.speaker.name}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteScheduleItem(item._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
