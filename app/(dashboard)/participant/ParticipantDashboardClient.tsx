"use client";

import React, { useState, useEffect } from "react";
import { Bell, Users, Calendar, Clock, Copy, ExternalLink, Trophy, Plus, CheckCircle, XCircle, HandHelping } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface Announcement {
    _id: string;
    title: string;
    message: string;
    roleTarget: string;
    createdAt: string;
}

interface Team {
  _id: string;
  name: string;
  description: string;
  inviteCode: string;
  maxMembers: number;
  status: string;
  isLookingForMembers: boolean;
  mentorRequested: boolean;
  mentorRequestMessage?: string;
  leader: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  event: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    status: string;
  };
  assignedMentor?: { _id: string; name: string; email: string };
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  repoLink: string;
  demoLink?: string;
  status: string;
  submittedAt: string;
  averageScore?: number;
  event: { _id: string; title: string; registrationDeadline: string; endDate: string };
  team: { _id: string; name: string };
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: string;
}

interface Props {
  user: User;
}

export default function ParticipantDashboardClient({ user }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showMentorRequest, setShowMentorRequest] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [requestingTeam, setRequestingTeam] = useState<Team | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAnnouncements();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/participant/dashboard");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
        setSubmissions(data.submissions || []);
        setAvailableEvents(data.availableEvents || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
      try {
          const res = await fetch("/api/announcements");
          if (res.ok) {
              const data = await res.json();
              setAnnouncements(data);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const requestMentor = async () => {
    if (!requestingTeam) return;
    setIsRequesting(true);
    try {
      const res = await fetch("/api/teams/mentor-request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: requestingTeam._id, message: mentorMessage })
      });
      if (res.ok) {
        fetchDashboardData();
        setShowMentorRequest(false);
        setMentorMessage("");
        setRequestingTeam(null);
      }
    } catch (err) {
      console.error("Error requesting mentor:", err);
    } finally {
      setIsRequesting(false);
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-8 text-white min-h-screen bg-space-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Participant Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Welcome Message */}
              <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700/50">
                <p className="text-gray-300 text-lg">Welcome back, <span className="text-neon-cyan font-semibold">{user?.name || "Participant"}</span>!</p>
                <p className="text-slate-400 mt-2">Ready to build something amazing today?</p>
              </div>

              {/* My Teams Section */}
              <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                          <Users className="w-5 h-5 text-neon-cyan" />
                          My Teams
                      </h2>
                      <Link href="/events" className="text-sm text-neon-cyan hover:text-white transition">
                        Browse Events →
                      </Link>
                  </div>
                  
                  {loading ? (
                      <p className="text-gray-500">Loading teams...</p>
                  ) : teams.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>You haven't joined any teams yet.</p>
                          <Link href="/events" className="mt-4 inline-block px-4 py-2 bg-neon-cyan text-black rounded hover:bg-white transition">
                              Browse Events
                          </Link>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {teams.map((team) => (
                              <div key={team._id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                  <div className="flex justify-between items-start mb-3">
                                      <div>
                                          <h3 className="font-semibold text-lg text-white">{team.name}</h3>
                                          <p className="text-sm text-slate-400">{team.event?.title}</p>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          team.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                      }`}>
                                          {team.status}
                                      </span>
                                  </div>
                                  
                                  {/* Invite Code */}
                                  <div className="flex items-center gap-2 mb-3 bg-slate-800 p-2 rounded">
                                      <span className="text-sm text-slate-400">Invite Code:</span>
                                      <code className="text-neon-cyan font-mono">{team.inviteCode}</code>
                                      <button 
                                          onClick={() => copyInviteCode(team.inviteCode)}
                                          className="p-1 hover:bg-slate-700 rounded transition"
                                          title="Copy invite code"
                                      >
                                          {copiedCode === team.inviteCode ? 
                                              <CheckCircle className="w-4 h-4 text-green-400" /> : 
                                              <Copy className="w-4 h-4 text-slate-400" />
                                          }
                                      </button>
                                  </div>

                                  {/* Team Members */}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                      <span className="text-sm text-slate-400">Members:</span>
                                      <span className="text-sm text-white">
                                          {team.members.length + 1}/{team.maxMembers}
                                      </span>
                                      {team.members.map((member) => (
                                          <span key={member._id} className="px-2 py-0.5 bg-slate-600 rounded text-xs">
                                              {member.name}
                                          </span>
                                      ))}
                                  </div>

                                  {/* Mentor */}
                                  {team.assignedMentor ? (
                                      <div className="flex items-center gap-2 text-sm text-slate-400">
                                          <HandHelping className="w-4 h-4" />
                                          <span>Mentor:</span>
                                          <span className="text-neon-cyan">{team.assignedMentor.name}</span>
                                      </div>
                                  ) : team.mentorRequested ? (
                                      <div className="flex items-center gap-2 text-sm text-yellow-400">
                                          <Clock className="w-4 h-4" />
                                          <span>Mentor requested</span>
                                      </div>
                                  ) : (
                                      <button
                                          onClick={() => { setRequestingTeam(team); setShowMentorRequest(true); }}
                                          className="flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition"
                                      >
                                          <HandHelping className="w-4 h-4" />
                                          Request Mentor
                                      </button>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Submissions Section */}
              <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700/50">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                      <Trophy className="w-5 h-5 text-neon-cyan" />
                      My Submissions
                  </h2>
                  
                  {loading ? (
                      <p className="text-gray-500">Loading submissions...</p>
                  ) : submissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No submissions yet.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {submissions.map((submission) => (
                              <div key={submission._id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <h3 className="font-semibold text-white">{submission.title}</h3>
                                          <p className="text-sm text-slate-400">{submission.event?.title} - {submission.team?.name}</p>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          submission.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                          submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                          'bg-yellow-500/20 text-yellow-400'
                                      }`}>
                                          {submission.status}
                                      </span>
                                  </div>
                                  
                                  <div className="flex gap-4 text-sm">
                                      {submission.repoLink && (
                                          <a href={submission.repoLink} target="_blank" rel="noopener noreferrer" 
                                             className="flex items-center gap-1 text-neon-cyan hover:text-white transition">
                                              <ExternalLink className="w-3 h-3" /> Repository
                                          </a>
                                      )}
                                      {submission.demoLink && (
                                          <a href={submission.demoLink} target="_blank" rel="noopener noreferrer"
                                             className="flex items-center gap-1 text-neon-cyan hover:text-white transition">
                                              <ExternalLink className="w-3 h-3" /> Demo
                                          </a>
                                      )}
                                  </div>

                                  {submission.averageScore !== undefined && submission.averageScore > 0 && (
                                      <div className="mt-2 text-sm text-neon-cyan">
                                          Score: {submission.averageScore.toFixed(1)}/100
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Important Deadlines */}
              <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700/50">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-neon-cyan" />
                      Important Deadlines
                  </h2>
                  
                  {teams.length === 0 ? (
                      <p className="text-gray-500">Join a team to see deadlines.</p>
                  ) : (
                      <div className="space-y-3">
                          {teams.map((team) => team.event && (
                              <div key={team._id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                                  <div>
                                      <p className="font-medium text-white">{team.event.title}</p>
                                      <p className="text-sm text-slate-400">{team.name}</p>
                                  </div>
                                  <div className="text-right">
                                      {team.event.registrationDeadline && !isDeadlinePassed(team.event.registrationDeadline) && (
                                          <p className="text-sm text-yellow-400">
                                              Registration: {getDaysLeft(team.event.registrationDeadline)} days left
                                          </p>
                                      )}
                                      {team.event.endDate && !isDeadlinePassed(team.event.endDate) && (
                                          <p className="text-sm text-neon-cyan">
                                              Event Ends: {getDaysLeft(team.event.endDate)} days left
                                          </p>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Available Events */}
              {availableEvents.length > 0 && (
                  <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700/50">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                          <Calendar className="w-5 h-5 text-neon-cyan" />
                          Available Events
                      </h2>
                      
                      <div className="space-y-3">
                          {availableEvents.map((event) => (
                              <div key={event._id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded hover:bg-slate-700/50 transition">
                                  <div>
                                      <p className="font-medium text-white">{event.title}</p>
                                      <p className="text-sm text-slate-400">
                                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                      </p>
                                  </div>
                                  <div className="text-right">
                                      {!isDeadlinePassed(event.registrationDeadline) ? (
                                          <p className="text-sm text-green-400">
                                              {getDaysLeft(event.registrationDeadline)} days to register
                                          </p>
                                      ) : (
                                          <p className="text-sm text-red-400">Registration closed</p>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* Sidebar / Announcements */}
          <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 overflow-hidden sticky top-8">
                  <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-neon-cyan" />
                      <h2 className="font-bold text-lg">Announcements</h2>
                  </div>
                  
                  <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
                      {loading ? (
                          <p className="text-gray-500 text-center py-4">Loading updates...</p>
                      ) : announcements.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No new announcements.</p>
                      ) : (
                          announcements.map((ann) => (
                              <div key={ann._id} className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-neon-cyan/50 transition-colors">
                                  <h3 className="font-semibold text-neon-cyan mb-1">{ann.title}</h3>
                                  <p className="text-sm text-gray-300 mb-2">{ann.message}</p>
                                  <p className="text-xs text-gray-500 text-right">
                                      {new Date(ann.createdAt).toLocaleDateString()}
                                  </p>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Mentor Request Modal */}
      {showMentorRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Request a Mentor</h3>
            <p className="text-slate-400 mb-4">
              Request mentor help for <span className="text-neon-cyan">{requestingTeam?.name}</span>
            </p>
            <textarea
              value={mentorMessage}
              onChange={(e) => setMentorMessage(e.target.value)}
              placeholder="What kind of help do you need? (optional)"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-neon-cyan"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowMentorRequest(false); setMentorMessage(""); setRequestingTeam(null); }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={requestMentor}
                disabled={isRequesting}
                className="flex-1 px-4 py-2 bg-neon-cyan text-black rounded-lg hover:bg-white transition disabled:opacity-50"
              >
                {isRequesting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
