"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Clock, Check, Link2, Twitter, Linkedin, Facebook, MessageCircle, CalendarPlus, ChevronDown, HelpCircle, ChevronRight, MapPin, User } from "lucide-react";
import CountdownTimer from "@/components/common/CountdownTimer";
import { downloadICS, downloadICSFromAPI, openInGoogleCalendar } from "@/utils/generateICS";

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
    const [copiedLink, setCopiedLink] = useState(false);
    const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [schedule, setSchedule] = useState([]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleShareTwitter = () => {
        const text = encodeURIComponent(`Check out this event: ${event?.title}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    };

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(`Check out this event: ${event?.title} - ${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    };

    /**
     * Download ICS file using client-side generation
     * Fast and doesn't require server resources
     */
    const handleDownloadICS = async () => {
        if (!event) return;
        
        try {
            setIsDownloading(true);
            setDownloadError(null);
            await downloadICS(event, `eventflow-${event._id}`);
        } catch (error) {
            console.error("Download error:", error);
            setDownloadError(error.message || "Failed to download calendar file");
        } finally {
            setIsDownloading(false);
        }
    };

    /**
     * Download ICS file from server API
     * Useful for ensuring server-side processing
     */
    const handleDownloadICSFromAPI = async () => {
        if (!event) return;
        
        try {
            setIsDownloading(true);
            setDownloadError(null);
            await downloadICSFromAPI(event._id, event.title);
        } catch (error) {
            console.error("API download error:", error);
            setDownloadError(error.message || "Failed to download calendar file from server");
        } finally {
            setIsDownloading(false);
        }
    };

    /**
     * Open Google Calendar with event pre-filled
     * Creates new event in user's Google Calendar
     */
    const handleAddToGoogleCalendar = () => {
        try {
            setDownloadError(null);
            openInGoogleCalendar(event);
            setCalendarMenuOpen(false);
        } catch (error) {
            console.error("Google Calendar error:", error);
            setDownloadError(error.message || "Failed to open Google Calendar");
        }
    };

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
                // Set schedule from event data
                if (data.event.schedule) {
                    setSchedule(data.event.schedule);
                }
            }
            
            // Also fetch FAQs
            const faqRes = await fetch(`/api/events/${pageId}/faqs`);
            if (faqRes.ok) {
                const faqData = await faqRes.json();
                setFaqs(faqData.faqs || []);
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
                    <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
                        {/* Abstract background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full -ml-20 -mb-20 blur-2xl"></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <h2 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-4">Event Starts In</h2>
                            <CountdownTimer targetDate={event.startDate} />
                        </div>
                    </div>
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
                        </div>

                        {/* Error notification */}
                        {downloadError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {downloadError}
                            </div>
                        )}

                        {/* Share & Calendar Actions */}
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                            <span className="text-sm text-slate-500 font-medium">Share & Add to Calendar:</span>
                            
                            {/* Calendar dropdown menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                                    disabled={isDownloading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download calendar file or open in calendar applications"
                                >
                                    <CalendarPlus className="w-4 h-4" />
                                    Add to Calendar
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Dropdown submenu */}
                                {calendarMenuOpen && (
                                    <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-48">
                                        <button
                                            onClick={handleDownloadICS}
                                            disabled={isDownloading}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 disabled:opacity-50"
                                        >
                                            📥 {isDownloading ? 'Downloading...' : 'Download .ics File'}
                                        </button>
                                        <button
                                            onClick={handleDownloadICSFromAPI}
                                            disabled={isDownloading}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 disabled:opacity-50"
                                        >
                                            🔗 {isDownloading ? 'Loading...' : 'Download via Server'}
                                        </button>
                                        <button
                                            onClick={handleAddToGoogleCalendar}
                                            disabled={isDownloading}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            📅 Add to Google Calendar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Copy link button */}
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm"
                                title="Copy event link to clipboard"
                            >
                                {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                                {copiedLink ? "Copied!" : "Copy Link"}
                            </button>

                            {/* Social share buttons */}
                            <button
                                onClick={handleShareTwitter}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-500 transition-colors shadow-sm"
                                title="Share on Twitter/X"
                            >
                                <Twitter className="w-4 h-4" />
                                Twitter
                            </button>
                            <button
                                onClick={handleShareLinkedIn}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors shadow-sm"
                                title="Share on LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                            </button>
                            <button
                                onClick={handleShareWhatsApp}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
                                title="Share on WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </button>
                            <button
                                onClick={handleShareFacebook}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                                title="Share on Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                                Facebook
                            </button>
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

                            {/* Schedule Section */}
                            {schedule && schedule.length > 0 && (
                                <>
                                    <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Event Schedule</h3>
                                    <div className="space-y-3">
                                        {[...schedule].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((item, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
                                            >
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
                                                            item.type === 'presentation' ? 'bg-cyan-100 text-cyan-700' :
                                                            item.type === 'competition' ? 'bg-orange-100 text-orange-700' :
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
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* FAQs Section */}
                            {faqs.length > 0 && (
                                <>
                                    <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Frequently Asked Questions</h3>
                                    <div className="space-y-3">
                                        {faqs.map((faq, index) => (
                                            <div 
                                                key={index}
                                                className="border border-slate-200 rounded-xl overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                                        <span className="font-medium text-slate-900">{faq.question}</span>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
                                                </button>
                                                {expandedFaq === index && (
                                                    <div className="p-4 bg-white border-t border-slate-200">
                                                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full capitalize mb-2">
                                                            {faq.category}
                                                        </span>
                                                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
