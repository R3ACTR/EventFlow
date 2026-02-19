'use client';
import { Input, Label, FormField } from "@/components/ui/form";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Award,
  Users,
  Clock,
  Edit2,
  Save,
  X,
  Shield,
  LogOut,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const [profileRes, teamRes] = await Promise.all([
        fetch("/api/auth/profile"),
        fetch("/api/teams"),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData.user);
        setEditForm({
          name: profileData.user.name || "",
          bio: profileData.user.bio || "",
        });
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (teamData.teams && teamData.teams.length > 0) {
          setTeam(teamData.teams[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
        showNotification("Profile updated successfully!", "success");
      } else {
        showNotification("Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ name: user?.name || "", bio: user?.bio || "" });
    setIsEditing(false);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "mentor":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "judge":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getAvatarGradient = (role) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-rose-600";
      case "mentor":
        return "from-purple-500 to-violet-600";
      case "judge":
        return "from-amber-500 to-orange-600";
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  const getDashboardLink = (role) => {
    switch (role) {
      case "admin": return "/admin";
      case "judge": return "/judge";
      case "mentor": return "/mentor";
      default: return "/participant";
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-sm">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Not signed in</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to view your profile</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const displayRole = user?.role || session?.user?.role || "participant";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right transition-all ${notification.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={getDashboardLink(displayRole)}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarGradient(displayRole)} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || session?.user?.name || "User"}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email || session?.user?.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 border ${getRoleBadgeStyle(displayRole)}`}
              >
                <Shield className="w-3 h-3" />
                {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5">
                {/* Name */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    {isEditing ? (
                      <FormField>
                        <Input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </FormField>
                    ) : (
                      <p className="font-medium text-slate-900">{user?.name || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-medium text-slate-900">{user?.email || session?.user?.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Bio */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Edit2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className={`text-sm ${user?.bio ? "text-slate-700" : "text-slate-400 italic"}`}>
                        {user?.bio || "No bio added yet. Click Edit to add one."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Member Since */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="font-medium text-slate-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "Recently joined"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info (Hidden for Judges) */}
            {displayRole !== "judge" && displayRole !== "admin" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Your Team
                </h3>

                {team ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-100">
                      <p className="font-semibold text-slate-900">{team.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{team.event?.title || "No event"}</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-slate-500">Role</span>
                        <span className="font-medium text-slate-900">
                          {team.leader?._id === user?._id ? "Leader" : "Member"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-slate-500">Members</span>
                        <span className="font-medium text-slate-900">
                          {(team.members?.length || 0) + 1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-slate-500">Invite Code</span>
                        <code className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md text-blue-700">
                          {team.inviteCode}
                        </code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm mb-3">No team yet</p>
                    <Link
                      href="/participant"
                      className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                    >
                      Create or join a team →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Activity Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Activity
              </h3>

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-500">Events Joined</span>
                  <span className="text-sm font-semibold text-slate-900">1</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-500">Events Joined</span>
                  <span className="text-sm font-semibold text-slate-900">1</span>
                </div>
                {displayRole !== "judge" && displayRole !== "admin" && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-500">Teams</span>
                    <span className="text-sm font-semibold text-slate-900">{team ? 1 : 0}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-500">Submissions</span>
                  <span className="text-sm font-semibold text-slate-900">3</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Days Active
                  </span>
                  <span className="text-sm font-semibold text-slate-900">7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
