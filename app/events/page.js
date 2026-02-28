"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, Trophy, ArrowRight, Star, MapPin, Search, FilterX, Twitter, Linkedin, Facebook, MessageCircle, Link2, Check, CalendarPlus, Bookmark, Bell } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";
import { downloadICS } from "@/utils/generateICS";
import { getBookmarks, addBookmark, removeBookmark } from "@/utils/bookmarks";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [copiedId, setCopiedId] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarked, setShowBookmarked] = useState(false);
    const [following, setFollowing] = useState([]);
    const [showFollowing, setShowFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);

    // Load bookmarks on mount
    useEffect(() => {
        setBookmarks(getBookmarks());
    }, []);

    // Load following events on mount
    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const response = await fetch('/api/user/following');
                const data = await response.json();
                if (data.followingEvents) {
                    setFollowing(data.followingEvents.map(e => e._id));
                }
            } catch (err) {
                console.error("Error fetching following events:", err);
            }
        };
        
        fetchFollowing();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events');
                const data = await response.json();
                
                if (data.events && Array.isArray(data.events)) {
                    // Transform API data to match display format
                    const transformedEvents = data.events.map(event => ({
                        id: event._id,
                        title: event.title,
                        date: new Date(event.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        }),
                        location: event.location || "Virtual",
                        category: event.tracks && event.tracks.length > 0 ? event.tracks[0] : "General",
                        participants: event.participants?.toString() || "TBD",
                        status: event.status === "ongoing" ? "Registration Open" : 
                                event.status === "upcoming" ? "Upcoming" : 
                                event.status === "completed" ? "Completed" : "Draft",
                        description: event.description,
                        startDate: event.startDate,
                        endDate: event.endDate,
                        registrationDeadline: event.registrationDeadline,
                        customDomain: event.customDomain || ""
                    }));
                    setEvents(transformedEvents);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const getEventPublicUrl = (event) => {
        if (event.customDomain) {
            return `${window.location.protocol}//${event.customDomain}`;
        }
        return `${window.location.origin}/events/${event.id}`;
    };

    const handleCopyLink = (event) => {
        const url = getEventPublicUrl(event);
        navigator.clipboard.writeText(url);
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleShareTwitter = (event) => {
        const text = encodeURIComponent(`Check out this event: ${event.title}`);
        const url = encodeURIComponent(getEventPublicUrl(event));
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    };

    const handleShareLinkedIn = (event) => {
        const url = encodeURIComponent(getEventPublicUrl(event));
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
    };

    const handleShareWhatsApp = (event) => {
        const text = encodeURIComponent(`Check out this event: ${event.title} - ${getEventPublicUrl(event)}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleShareFacebook = (event) => {
        const url = encodeURIComponent(getEventPublicUrl(event));
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    };

    const handleAddToCalendar = (event, e) => {
        e.stopPropagation();
        downloadICS({
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            registrationDeadline: event.registrationDeadline
        }, `eventflow-${event.id}`);
    };

    const handleToggleBookmark = (eventId, e) => {
        e.stopPropagation();
        if (bookmarks.includes(eventId)) {
            setBookmarks(removeBookmark(eventId));
        } else {
            setBookmarks(addBookmark(eventId));
        }
    };

    const handleToggleFollow = async (eventId, e) => {
        e.stopPropagation();
        setFollowingLoading(true);
        
        const isFollowing = following.includes(eventId);
        const action = isFollowing ? 'unfollow' : 'follow';
        
        try {
            const response = await fetch('/api/user/following', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, action })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (isFollowing) {
                    setFollowing(prev => prev.filter(id => id !== eventId));
                } else {
                    setFollowing(prev => [...prev, eventId]);
                }
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
        } finally {
            setFollowingLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCategory("");
        setLocation("");
        setShowBookmarked(false);
        setShowFollowing(false);
    };

    const hasActiveFilters = searchTerm || category || location || showBookmarked || showFollowing;

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              event.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category ? event.category === category : true;
        const matchesLocation = location ? event.location.includes(location) : true;
        const matchesBookmark = showBookmarked ? bookmarks.includes(event.id) : true;
        const matchesFollowing = showFollowing ? following.includes(event.id) : true;
        
        return matchesSearch && matchesCategory && matchesLocation && matchesBookmark && matchesFollowing;
    });

    const categories = Array.from(new Set(events.map(e => e.category)));
    const locations = Array.from(new Set(events.map(e => e.location)));

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
            <section className="relative z-10 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full text-neon-cyan text-sm font-medium mb-8 backdrop-blur-sm">
                        <Star className="w-4 h-4" />
                        Discover Amazing Events
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white mb-6 leading-[1.1] tracking-tight font-serif italic">
                        Browse <span className="font-serif italic text-neon-cyan">Upcoming</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-cyan to-white/80">
                            Tech Events
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-mono">
                        Join hackathons, competitions, and tech events from around the world.
                        Find your next challenge and connect with innovative minds.
                    </p>
                </div>
            </section>

            {/* Filters Section */}
            <section className="relative z-10 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card border-glow p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors w-full"
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none min-w-[150px]"
                            >
                                <option value="" className="bg-space-900">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-space-900">{cat}</option>
                                ))}
                            </select>

                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none min-w-[150px]"
                            >
                                <option value="" className="bg-space-900">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc} className="bg-space-900">{loc}</option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-xl transition-all duration-300 font-medium whitespace-nowrap"
                                >
                                    <FilterX className="w-4 h-4" />
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => setShowBookmarked(!showBookmarked)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all duration-300 font-medium whitespace-nowrap ${
                                    showBookmarked 
                                        ? 'bg-neon-violet/20 text-neon-violet border-neon-violet/30 hover:bg-neon-violet/30'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                <Bookmark className={`w-4 h-4 ${showBookmarked ? 'fill-current' : ''}`} />
                                {showBookmarked ? 'Show All' : 'Watch Later'}
                            </button>
                            <button
                                onClick={() => setShowFollowing(!showFollowing)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all duration-300 font-medium whitespace-nowrap ${
                                    showFollowing 
                                        ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/30'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                <Bell className={`w-4 h-4 ${showFollowing ? 'fill-current' : ''}`} />
                                {showFollowing ? 'Show All' : 'Following'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Grid Section */}
            <section className="relative z-10 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400">Loading events...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 glass-card rounded-2xl border-glow">
                            <h3 className="text-2xl font-semibold text-white mb-2">Unable to load events</h3>
                            <p className="text-slate-400">{error}</p>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="glass-card border-glow p-8 rounded-2xl transition-all duration-400 group hover:scale-[1.02] cursor-pointer"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Status Badge & Bookmark */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${event.status === "Registration Open"
                                                ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                                                : event.status === "Upcoming"
                                                    ? "bg-neon-violet/20 text-neon-violet border border-neon-violet/30"
                                                    : event.status === "Completed"
                                                        ? "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                                                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                            }`}>
                                            {event.status}
                                        </span>
                                        <button
                                            onClick={(e) => handleToggleBookmark(event.id, e)}
                                            className={`p-2 rounded-lg border transition-all duration-300 ${
                                                bookmarks.includes(event.id)
                                                    ? 'border-neon-violet/50 bg-neon-violet/20 text-neon-violet'
                                                    : 'border-white/10 hover:border-neon-violet/50 hover:bg-neon-violet/10 text-slate-400 hover:text-neon-violet'
                                            }`}
                                            title={bookmarks.includes(event.id) ? "Remove from Watch Later" : "Add to Watch Later"}
                                        >
                                            <Bookmark className={`w-4 h-4 ${bookmarks.includes(event.id) ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={(e) => handleToggleFollow(event.id, e)}
                                            disabled={followingLoading}
                                            className={`p-2 rounded-lg border transition-all duration-300 ${
                                                following.includes(event.id)
                                                    ? 'border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan'
                                                    : 'border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan'
                                            }`}
                                            title={following.includes(event.id) ? "Unfollow event" : "Follow event for updates"}
                                        >
                                            <Bell className={`w-4 h-4 ${following.includes(event.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Event Title */}
                                    <h3 className="text-xl font-semibold text-white mb-2 tracking-wide group-hover:text-neon-cyan transition-colors">
                                        {event.title}
                                    </h3>
                                    
                                    <div className="mb-4">
                                        <span className="text-xs text-neon-violet border border-neon-violet/30 bg-neon-violet/10 px-2 py-1 rounded-md">
                                            {event.category}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-400 leading-relaxed text-sm font-mono mb-6">
                                        {event.description}
                                    </p>

                                    {/* Event Details */}
                                    <div className="flex items-center gap-4 mb-6 text-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-mono">{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="font-mono">{event.location}</span>
                                        </div>
                                    </div>

                                    {/* Action Button & Share Icons */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAddToCalendar(event, e); }}
                                                className="p-2 rounded-lg border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all duration-300"
                                                title="Add to Calendar"
                                            >
                                                <CalendarPlus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopyLink(event); }}
                                                className={`p-2 rounded-lg border transition-all duration-300 ${copiedId === event.id ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/10 hover:border-white/30 text-slate-400 hover:text-white'}`}
                                                title="Copy link"
                                            >
                                                {copiedId === event.id ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShareTwitter(event); }}
                                                className="p-2 rounded-lg border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-all duration-300"
                                                title="Share on Twitter"
                                            >
                                                <Twitter className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShareLinkedIn(event); }}
                                                className="p-2 rounded-lg border border-white/10 hover:border-blue-600/50 hover:bg-blue-600/10 text-slate-400 hover:text-blue-500 transition-all duration-300"
                                                title="Share on LinkedIn"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(event); }}
                                                className="p-2 rounded-lg border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-all duration-300"
                                                title="Share on WhatsApp"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShareFacebook(event); }}
                                                className="p-2 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-all duration-300"
                                                title="Share on Facebook"
                                            >
                                                <Facebook className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:border-neon-cyan/30"
                                        >
                                            View Event
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 glass-card rounded-2xl border-glow">
                            <h3 className="text-2xl font-semibold text-white mb-2">No events found</h3>
                            <p className="text-slate-400">Try adjusting your filters or clearing them to see more results.</p>
                            <button
                                onClick={clearFilters}
                                className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card rounded-3xl p-10 sm:p-12 border-glow">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                            Want to Organize Your Own Event?
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 font-mono">
                            Create your hackathon or tech event with EventFlow&apos;s powerful platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="btn-neon inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 tracking-wide text-sm"
                            >
                                Start Organizing
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                            >
                                Sign In
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
                                <Trophy className="w-5 h-5 text-white" />
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
