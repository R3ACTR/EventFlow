'use client';
import { Input, Label } from "@/components/ui/form";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Trophy,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  User,
  LayoutGrid,
  Search,
  ChevronRight,
  X,
  RefreshCcw
} from "lucide-react";
import TeamBoard from "@/components/dashboards/TeamBoard";
import useFocusTrap from "@/components/common/useFocusTrap";
import { handleTabListKeyDown } from "@/components/common/keyboardNavigation";

export default function ParticipantDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user;

  // State for tabs
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "teamboard" | "joined"

  // Data states
  const [myTeams, setMyTeams] = useState([]); // Array of teams user is part of
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [notification, setNotification] = useState(null);
  const createModalRef = useRef(null);
  const joinModalRef = useRef(null);
  const createTeamInputRef = useRef(null);
  const joinCodeInputRef = useRef(null);

  useFocusTrap({
    isOpen: showCreateModal,
    containerRef: createModalRef,
    onClose: () => setShowCreateModal(false),
    initialFocusRef: createTeamInputRef,
  });

  useFocusTrap({
    isOpen: showJoinModal,
    containerRef: joinModalRef,
    onClose: () => setShowJoinModal(false),
    initialFocusRef: joinCodeInputRef,
  });

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(""); // For team creation
  const [teamBoardEventId, setTeamBoardEventId] = useState(""); // For team board filtering
  const [joinCode, setJoinCode] = useState("");

  // Fetch data
  useEffect(() => {
    if (status === "authenticated" && user?.id) {
      fetchUserData(user.id);
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, user?.id]);

  const fetchUserData = async (userId, manualRefresh = false) => {
    if (manualRefresh) setIsRefreshing(true);
    try {
      // 1. Fetch user's teams
      const teamRes = await fetch(`/api/teams?userId=${userId}`);
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setMyTeams(teamData.teams || []);
      }

      // 2. Fetch available events
      const eventsRes = await fetch("/api/events");
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      if (manualRefresh) setIsRefreshing(false);
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!newTeamName.trim() || !selectedEventId) {
      showNotification("Please enter a team name and select an event", "error");
      return;
    }

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName,
          leaderId: user?.id,
          eventId: selectedEventId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMyTeams([data.team, ...myTeams]); // Add new team to list
        setShowCreateModal(false);
        setNewTeamName("");
        setSelectedEventId("");
        showNotification("Team created successfully!", "success");
        setActiveTab("joined"); // Switch to joined tab to show the new team
      } else {
        showNotification(data.error || "Failed to create team", "error");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      showNotification("Failed to create team", "error");
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      showNotification("Please enter an invite code", "error");
      return;
    }

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode, userId: user?.id })
      });

      const data = await res.json();

      if (res.ok) {
        setMyTeams([data.team, ...myTeams]);
        setShowJoinModal(false);
        setJoinCode("");
        showNotification("Joined team successfully!", "success");
        setActiveTab("joined"); // Switch to joined tab
      } else {
        showNotification(data.error || "Failed to join team", "error");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      showNotification("Failed to join team", "error");
    }
  };

  const copyInviteCode = (code) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setInviteCodeCopied(true);
      showNotification("Invite code copied to clipboard!", "success");
      setTimeout(() => setInviteCodeCopied(false), 2000);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getDaysUntil = (date) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          {notification.type === "success" ? <Check className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.name || "Participant"}</h1>
              <p className="mt-1 text-blue-100">Find hackathons or manage your current teams.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Profile</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            className="flex gap-8 mt-10"
            role="tablist"
            aria-label="Participant dashboard sections"
            onKeyDown={handleTabListKeyDown}
          >
            <button
              onClick={() => setActiveTab("browse")}
              id="participant-tab-browse"
              role="tab"
              aria-selected={activeTab === "browse"}
              aria-controls="participant-tabpanel-browse"
              tabIndex={activeTab === "browse" ? 0 : -1}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "browse" ? "border-white text-white" : "border-transparent text-blue-200 hover:text-white"
                }`}
            >
              <Search className="w-4 h-4" />
              Available Events
            </button>
            <button
              onClick={() => setActiveTab("teamboard")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "teamboard" ? "border-white text-white" : "border-transparent text-blue-200 hover:text-white"
                }`}
            >
              <Users className="w-4 h-4" />
              Team Board
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              id="participant-tab-joined"
              role="tab"
              aria-selected={activeTab === "joined"}
              aria-controls="participant-tabpanel-joined"
              tabIndex={activeTab === "joined" ? 0 : -1}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "joined" ? "border-white text-white" : "border-transparent text-blue-200 hover:text-white"
                }`}
            >
              <Trophy className="w-4 h-4" />
              My Hackathons
              {myTeams.length > 0 && (
                <span className="bg-white/20 text-white text-xs py-0.5 px-2 rounded-full ml-1">
                  {myTeams.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* BROWSE / AVAILABLE EVENTS TAB */}
        {activeTab === "browse" && (
          <div
            className="animate-in fade-in duration-300"
            role="tabpanel"
            id="participant-tabpanel-browse"
            aria-labelledby="participant-tab-browse"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Hackathons</h2>
                <button
                  onClick={() => fetchUserData(user?.id, true)}
                  disabled={isRefreshing}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Refresh Events"
                >
                  <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
              {events.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No upcoming events found at the moment.</p>
                </div>
              ) : (
                events.map((event) => {
                  const isParticipating = myTeams.some(team => team.event?._id === event._id);
                  return (
                    <div key={event._id} className="p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {getDaysUntil(event.endDate)} days left
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-slate-400" />
                              Max {event.maxTeamSize} per team
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/events/${event._id}`}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Details
                          </Link>
                          <button
                            disabled={isParticipating}
                            onClick={() => {
                              setSelectedEventId(event._id);
                              setNewTeamName(`${user?.name}'s Team - ${event.title}`);
                              setShowCreateModal(true);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${isParticipating
                              ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                              : "text-white bg-blue-600 hover:bg-blue-700"
                              }`}
                          >
                            {isParticipating ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Already Applied
                              </span>
                            ) : "Apply Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* TEAM BOARD TAB */}
        {activeTab === "teamboard" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Team Board</h2>
                <p className="text-slate-500 text-sm mt-1">Find open teams or solo participants for your event.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700">Select Event:</label>
                <div className="flex items-center gap-2">
                  <select 
                    value={teamBoardEventId}
                    onChange={(e) => setTeamBoardEventId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
                  >
                    <option value="">Choose an event...</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                  {teamBoardEventId && (
                    <button
                      onClick={() => setTeamBoardEventId("")}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Clear Filter"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {teamBoardEventId ? (
              <TeamBoard eventId={teamBoardEventId} userId={user?.id} />
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to find a team?</h3>
                    <p className="text-slate-500 mb-8">Please select a hackathon from the dropdown above to see teams looking for members.</p>
                    <div className="flex flex-col gap-3">
                        {events.slice(0, 3).map(event => (
                            <button 
                                key={event._id}
                                onClick={() => setTeamBoardEventId(event._id)}
                                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group"
                            >
                                <span className="font-semibold text-slate-700 group-hover:text-blue-600">{event.title}</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY HACKATHONS TAB */}
        {activeTab === "joined" && (
          <div
            className="animate-in fade-in duration-300"
            role="tabpanel"
            id="participant-tabpanel-joined"
            aria-labelledby="participant-tab-joined"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Participating Events</h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Join Existing Team
              </button>
            </div>

            {myTeams.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-500">
                <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900">No events yet</h3>
                <p className="mt-1">You haven't joined any hackathons yet.</p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Browse available events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTeams.map((team) => (
                  <div key={team._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Participating
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mt-3 text-lg line-clamp-1" title={team.event?.title}>{team.event?.title || "Unknown Event"}</h3>
                      <p className="text-slate-500 text-sm mt-1">Team: <span className="font-medium text-slate-700">{team.name}</span></p>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center text-sm text-slate-600 gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{team.members?.length || 0} Members</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{team.event?.startDate ? new Date(team.event.startDate).toLocaleDateString() : "TBD"}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 gap-2 bg-slate-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-slate-500 uppercase">Code:</span>
                        <code className="font-mono text-slate-900 font-medium flex-1">
                          {team.inviteCode}
                        </code>
                        <button
                          onClick={() => copyInviteCode(team.inviteCode)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Copy Invite Code"
                        >
                          {inviteCodeCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                      <Link
                        href={`/participant/teams/${team._id}`}
                        className="py-2 text-sm font-medium text-center text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Manage
                      </Link>
                      <Link
                        href={`/events/${team.event?._id}`}
                        className="py-2 text-sm font-medium text-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Event Page
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={createModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-team-title"
            tabIndex={-1}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
          >
            <h3 id="create-team-title" className="text-xl font-bold text-slate-900 mb-4">Create Team</h3>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Event</Label>
                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium">
                  {events.find(e => e._id === selectedEventId)?.title || "Selected Event"}
                </div>
              </div>
              <div className="mb-4">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Team Name</Label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  ref={createTeamInputRef}
                  placeholder="e.g. Code Wizards"
                  required
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={joinModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-team-title"
            tabIndex={-1}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
          >
            <h3 id="join-team-title" className="text-xl font-bold text-slate-900 mb-4">Join a Team</h3>
            <form onSubmit={handleJoinTeam}>
              <div className="mb-4">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Invite Code</Label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  ref={joinCodeInputRef}
                  placeholder="Enter 6-digit code"
                  required
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Join Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
