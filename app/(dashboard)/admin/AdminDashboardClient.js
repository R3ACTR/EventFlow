"use client";

import React, { useRef, useState, useEffect } from "react";
import useFocusTrap from "@/components/common/useFocusTrap";
import { handleTabListKeyDown } from "@/components/common/keyboardNavigation";

// Icons as simple SVG components
const Icons = {
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Megaphone: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  ),
};

// Role badge colors
const roleColors = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  organizer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  participant: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  mentor: "bg-green-500/20 text-green-400 border-green-500/30",
  judge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

// Status badge colors
const statusColors = {
  ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function AdminDashboardClient({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
    roleDistribution: {},
    eventStatusDistribution: {},
  });
  const [analytics, setAnalytics] = useState({
    totals: {
      events: 0,
      teams: 0,
      submissions: 0,
      participants: 0,
      activeEvents: 0,
      upcomingEvents: 0,
    },
    distributions: {
      events: {},
      submissions: {},
    },
    trends: {
      participants: [],
      teams: [],
    },
    generatedAt: null,
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Events State
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft",
    modules: {
      judging: true,
      certificates: true,
      gallery: true,
      teams: true,
    },
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const userModalRef = useRef(null);
  const roleSelectRef = useRef(null);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: "",
    message: "",
    roleTarget: "all",
    expiresAt: "",
  });

  // Initial data fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Tab-specific data fetching
  useEffect(() => {
    if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "announcements") {
      fetchAnnouncements();
    }
  }, [activeTab, userRoleFilter, userPagination.page]);

  useEffect(() => {
    if (activeTab !== "analytics") return undefined;
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Debounced search for users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "users") {
        setUserPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch users count
      const usersRes = await fetch("/api/users?limit=1");
      const usersData = usersRes.ok ? await usersRes.json() : { roleDistribution: {}, pagination: { total: 0 } };
      
      // Fetch events count
      const eventsRes = await fetch("/api/events");
      const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };
      
      // Fetch announcements count
      const announcementsRes = await fetch("/api/announcements");
      const announcementsData = announcementsRes.ok ? await announcementsRes.json() : [];

      // Calculate event status distribution
      const eventStatusDist = {};
      eventsData.events?.forEach(event => {
        eventStatusDist[event.status] = (eventStatusDist[event.status] || 0) + 1;
      });

      setStats({
        totalUsers: usersData.pagination?.total || 0,
        totalEvents: eventsData.events?.length || 0,
        totalAnnouncements: announcementsData.length || 0,
        roleDistribution: usersData.roleDistribution || {},
        eventStatusDistribution: eventStatusDist,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // --- Events Logic ---
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModuleToggle = (moduleName) => {
    setEventFormData((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: !prev.modules[moduleName],
      },
    }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEvent
        ? `/api/events/${editingEvent._id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventFormData),
      });

      if (res.ok) {
        setShowEventForm(false);
        setEditingEvent(null);
        fetchEvents();
        fetchStats();
        setEventFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          status: "draft",
          modules: {
            judging: true,
            certificates: true,
            gallery: true,
            teams: true,
          },
        });
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to save event"}`);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      status: event.status,
      modules: event.modules || {
        judging: true,
        certificates: true,
        gallery: true,
        teams: true,
      },
    });
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        fetchEvents();
        fetchStats();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to delete event"}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // --- Users Logic ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({
        page: userPagination.page,
        limit: userPagination.limit,
      });
      if (userRoleFilter !== "all") params.append("role", userRoleFilter);
      if (userSearch) params.append("search", userSearch);

      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUserPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleEditUser = (userItem) => {
    setEditingUser(userItem);
    setShowUserEditModal(true);
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
        fetchStats();
        setShowUserEditModal(false);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || "Failed to update user"}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/users?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
        fetchStats();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || "Failed to delete user"}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // --- Announcements Logic ---
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(announcementFormData),
      });

      if (res.ok) {
        setShowAnnouncementForm(false);
        fetchAnnouncements();
        fetchStats();
        setAnnouncementFormData({
          title: "",
          message: "",
          roleTarget: "all",
          expiresAt: "",
        });
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to create announcement"}`);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm("Are you sure you want to deactivate this announcement?")) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchAnnouncements();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

  // Render stat card
  const StatCard = ({ title, value, icon: Icon, color, subtext, isLoading }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{isLoading ? "..." : formatNumber(value)}</p>
          {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  // Render distribution card for overview
  const DistributionCard = ({ title, data, colors }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {Object.keys(data).length === 0 ? (
        <p className="text-slate-500 text-sm">No data available</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${colors[key] || "bg-slate-500"}`}></span>
                <span className="text-slate-300 capitalize text-sm">{key}</span>
              </div>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, subtitle, children }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );

  const BarChart = ({ data, height = 160 }) => {
    const maxValue = Math.max(1, ...data.map((item) => item.value));
    return (
      <div className="space-y-4">
        <div className="flex items-end gap-3" style={{ height }}>
          {data.map((item) => {
            const barHeight = Math.round((item.value / maxValue) * 100);
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-slate-400">{formatNumber(item.value)}</div>
                <div className="w-full bg-slate-700/50 rounded-lg overflow-hidden flex items-end" style={{ height: height - 40 }}>
                  <div
                    className={`${item.color || "bg-indigo-500"} w-full transition-all duration-300`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 text-center">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const LineChart = ({ data }) => {
    const width = 320;
    const height = 120;
    const padding = 16;
    const maxValue = Math.max(1, ...data.map((item) => item.value));
    const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
    const points = data
      .map((item, index) => {
        const x = padding + step * index;
        const y = height - padding - (item.value / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="space-y-4">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <polyline
            fill="none"
            stroke="rgb(99 102 241)"
            strokeWidth="2"
            points={points}
          />
          {data.map((item, index) => {
            const x = padding + step * index;
            const y = height - padding - (item.value / maxValue) * (height - padding * 2);
            return <circle key={item.label} cx={x} cy={y} r="3" fill="rgb(99 102 241)" />;
          })}
        </svg>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-400">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>{item.label}</span>
              <span className="ml-auto text-slate-500">{formatNumber(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const roleDistributionColors = {
    admin: "bg-red-500",
    organizer: "bg-purple-500",
    participant: "bg-blue-500",
    mentor: "bg-green-500",
    judge: "bg-amber-500",
  };

  const eventStatusColors = {
    ongoing: "bg-green-500",
    upcoming: "bg-blue-500",
    completed: "bg-gray-500",
    draft: "bg-yellow-500",
  };

  const eventStatusOrder = ["draft", "upcoming", "ongoing", "completed"];
  const submissionStatusOrder = ["pending", "accepted", "rejected"];

  const analyticsEventChart = eventStatusOrder.map((status) => ({
    label: status,
    value: analytics.distributions.events?.[status] || 0,
    color: eventStatusColors[status],
  }));

  const analyticsSubmissionChart = submissionStatusOrder.map((status) => ({
    label: status,
    value: analytics.distributions.submissions?.[status] || 0,
    color:
      status === "accepted"
        ? "bg-emerald-500"
        : status === "rejected"
          ? "bg-rose-500"
          : "bg-amber-500",
  }));

  const tabs = [
    { id: "overview", label: "Overview", icon: Icons.Chart },
    { id: "analytics", label: "Analytics", icon: Icons.Activity },
    { id: "users", label: "Users", icon: Icons.Users },
    { id: "events", label: "Events", icon: Icons.Calendar },
    { id: "announcements", label: "Announcements", icon: Icons.Megaphone },
  ];

  useFocusTrap({
    isOpen: showUserEditModal,
    containerRef: userModalRef,
    onClose: () => setShowUserEditModal(false),
    initialFocusRef: roleSelectRef,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user?.name || "Admin"}! Manage your platform from here.</p>
      </div>

      {/* Tabs Navigation */}
      <div
        className="flex flex-wrap gap-2 mb-8 border-b border-slate-700/50 pb-4"
        role="tablist"
        aria-label="Admin dashboard sections"
        onKeyDown={handleTabListKeyDown}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            id={`admin-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`admin-tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div
          className="space-y-6 animate-fadeIn"
          role="tabpanel"
          id="admin-tabpanel-overview"
          aria-labelledby="admin-tab-overview"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={Icons.Users} 
              color="bg-blue-500/20 text-blue-400"
              subtext="Registered users"
              isLoading={loading}
            />
            <StatCard 
              title="Total Events" 
              value={stats.totalEvents} 
              icon={Icons.Calendar} 
              color="bg-purple-500/20 text-purple-400"
              subtext="All events"
              isLoading={loading}
            />
            <StatCard 
              title="Active Announcements" 
              value={stats.totalAnnouncements} 
              icon={Icons.Megaphone} 
              color="bg-amber-500/20 text-amber-400"
              subtext="Published"
              isLoading={loading}
            />
            <StatCard 
              title="Admin" 
              value={stats.roleDistribution.admin || 0} 
              icon={Icons.Shield} 
              color="bg-red-500/20 text-red-400"
              subtext="Administrators"
              isLoading={loading}
            />
          </div>

          {/* Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionCard 
              title="Users by Role" 
              data={stats.roleDistribution}
              colors={roleDistributionColors}
            />
            <DistributionCard 
              title="Events by Status" 
              data={stats.eventStatusDistribution}
              colors={eventStatusColors}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setActiveTab("events"); setShowEventForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Icons.Plus /> Create Event
              </button>
              <button
                onClick={() => { setActiveTab("announcements"); setShowAnnouncementForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Icons.Megaphone /> New Announcement
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Icons.Users /> Manage Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div
          className="space-y-6 animate-fadeIn"
          role="tabpanel"
          id="admin-tabpanel-analytics"
          aria-labelledby="admin-tab-analytics"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Event Analytics</h2>
              <p className="text-slate-400 text-sm">Track participation and activity across events.</p>
            </div>
            <div className="text-xs text-slate-500">
              Last updated: {analytics.generatedAt ? new Date(analytics.generatedAt).toLocaleTimeString() : "—"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Participants"
              value={analytics.totals.participants}
              icon={Icons.Users}
              color="bg-blue-500/20 text-blue-400"
              subtext="Total registered"
              isLoading={loadingAnalytics}
            />
            <StatCard
              title="Teams"
              value={analytics.totals.teams}
              icon={Icons.Shield}
              color="bg-emerald-500/20 text-emerald-400"
              subtext="Active teams"
              isLoading={loadingAnalytics}
            />
            <StatCard
              title="Submissions"
              value={analytics.totals.submissions}
              icon={Icons.Megaphone}
              color="bg-amber-500/20 text-amber-400"
              subtext="Total entries"
              isLoading={loadingAnalytics}
            />
            <StatCard
              title="Active Events"
              value={analytics.totals.activeEvents}
              icon={Icons.Calendar}
              color="bg-purple-500/20 text-purple-400"
              subtext={`Upcoming: ${formatNumber(analytics.totals.upcomingEvents)}`}
              isLoading={loadingAnalytics}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Event Status Distribution" subtitle="Event pipeline across the platform.">
              <BarChart data={analyticsEventChart} />
            </ChartCard>
            <ChartCard title="Submission Outcomes" subtitle="Acceptance rates across events.">
              <BarChart data={analyticsSubmissionChart} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Participant Growth" subtitle="Last 6 months of participant registrations.">
              <LineChart data={analytics.trends.participants} />
            </ChartCard>
            <ChartCard title="Team Creation" subtitle="Teams formed in the last 6 months.">
              <LineChart data={analytics.trends.teams} />
            </ChartCard>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div
          className="space-y-6 animate-fadeIn"
          role="tabpanel"
          id="admin-tabpanel-users"
          aria-labelledby="admin-tab-users"
        >
          {/* Users Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">User Management</h2>
              <p className="text-slate-400 text-sm">Manage platform users and roles</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Icons.Search />
                </div>
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="organizer">Organizer</option>
                <option value="participant">Participant</option>
                <option value="mentor">Mentor</option>
                <option value="judge">Judge</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Email</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Role</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Joined</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-6 text-center text-slate-500">Loading users...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-6 text-center text-slate-500">No users found</td>
                    </tr>
                  ) : (
                    users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {userItem.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span className="text-white font-medium">{userItem.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-300">{userItem.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors[userItem.role] || roleColors.participant}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-sm">
                          {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem._id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userPagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                <span className="text-slate-400 text-sm">
                  Showing {Math.min((userPagination.page - 1) * userPagination.limit + 1, userPagination.total)} to {Math.min(userPagination.page * userPagination.limit, userPagination.total)} of {userPagination.total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={userPagination.page === 1}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icons.ChevronLeft />
                  </button>
                  <span className="px-4 py-2 text-slate-300">
                    Page {userPagination.page} of {userPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setUserPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={userPagination.page === userPagination.totalPages}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icons.ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div
          className="space-y-6 animate-fadeIn"
          role="tabpanel"
          id="admin-tabpanel-events"
          aria-labelledby="admin-tab-events"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Event Management</h2>
              <p className="text-slate-400 text-sm">Create and manage events</p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventFormData({
                  title: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  status: "draft",
                  modules: {
                    judging: true,
                    certificates: true,
                    gallery: true,
                    teams: true,
                  },
                });
                setShowEventForm(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Icons.Plus /> Create Event
            </button>
          </div>

          {showEventForm && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-white">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h3>
              <form onSubmit={handleEventSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={eventFormData.title}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Status</label>
                    <select
                      name="status"
                      value={eventFormData.status}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={eventFormData.startDate}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={eventFormData.endDate}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                  <textarea
                    name="description"
                    value={eventFormData.description}
                    onChange={handleEventInputChange}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white h-28 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  ></textarea>
                </div>

                {/* Module Toggles */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3 text-slate-300 border-b border-slate-700/50 pb-2">
                    Event Modules
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(eventFormData.modules).map((module) => (
                      <div key={module} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`module-${module}`}
                          checked={eventFormData.modules[module]}
                          onChange={() => handleModuleToggle(module)}
                          className="w-5 h-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <label htmlFor={`module-${module}`} className="text-sm font-medium text-slate-300 capitalize select-none cursor-pointer">
                          {module}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingEvents ? (
            <div className="text-center py-12 text-slate-500">Loading events...</div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Event</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Dates</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Modules</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                        No events found. Create your first event!
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{event.title}</p>
                            <p className="text-slate-500 text-sm truncate max-w-xs">{event.description?.substring(0, 60)}...</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[event.status] || statusColors.draft}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-300 text-sm">
                          <div>{event.startDate ? new Date(event.startDate).toLocaleDateString() : "N/A"}</div>
                          <div className="text-slate-500">to {event.endDate ? new Date(event.endDate).toLocaleDateString() : "N/A"}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {event.modules && Object.entries(event.modules)
                              .filter(([_, enabled]) => enabled)
                              .map(([module]) => (
                                <span key={module} className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                                  {module}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div
          className="space-y-6 animate-fadeIn"
          role="tabpanel"
          id="admin-tabpanel-announcements"
          aria-labelledby="admin-tab-announcements"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Announcements</h2>
              <p className="text-slate-400 text-sm">Create and manage announcements</p>
            </div>
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Icons.Plus /> New Announcement
            </button>
          </div>

          {showAnnouncementForm && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-white">Create Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={announcementFormData.title}
                      onChange={handleAnnouncementInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Target Audience</label>
                    <select
                      name="roleTarget"
                      value={announcementFormData.roleTarget}
                      onChange={handleAnnouncementInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">All Users</option>
                      <option value="participants">Participants</option>
                      <option value="judges">Judges</option>
                      <option value="mentors">Mentors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Expires At (Optional)</label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={announcementFormData.expiresAt}
                      onChange={handleAnnouncementInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-slate-300">Message</label>
                  <textarea
                    name="message"
                    value={announcementFormData.message}
                    onChange={handleAnnouncementInputChange}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white h-32 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementForm(false)}
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Post Announcement
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingAnnouncements ? (
            <div className="text-center py-12 text-slate-500">Loading announcements...</div>
          ) : (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
                  <p className="text-slate-500">No active announcements.</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann._id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white mb-2">{ann.title}</h3>
                      <p className="text-slate-300 mt-2">{ann.message}</p>
                      <div className="flex gap-6 mt-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Target: <span className="capitalize text-slate-400">{ann.roleTarget}</span>
                        </span>
                        <span>Posted: {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : "N/A"}</span>
                        {ann.expiresAt && <span>Expires: {new Date(ann.expiresAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                      title="Deactivate"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* User Edit Modal */}
      {showUserEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={userModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-edit-title"
            tabIndex={-1}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 id="admin-user-edit-title" className="text-xl font-bold text-white mb-6">Edit User Role</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Name</label>
                <p className="text-white">{editingUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                <p className="text-slate-400">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Role</label>
                <select
                  defaultValue={editingUser.role}
                  onChange={(e) => handleUpdateUserRole(editingUser._id, e.target.value)}
                  ref={roleSelectRef}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="participant">Participant</option>
                  <option value="organizer">Organizer</option>
                  <option value="mentor">Mentor</option>
                  <option value="judge">Judge</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => setShowUserEditModal(false)}
                className="w-full px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
