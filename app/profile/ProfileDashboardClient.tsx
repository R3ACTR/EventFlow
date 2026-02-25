"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Edit2, Github, Linkedin, Globe, Mail, Shield, User as UserIcon } from "lucide-react";
import Button from "@/components/common/Button";

const getGithubUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  if (value.includes('github.com')) return `https://${value}`;
  const cleanValue = value.replace(/^@/, '');
  return `https://github.com/${cleanValue}`;
};

const getLinkedinUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  if (value.includes('linkedin.com')) return `https://${value}`;
  return `https://linkedin.com/in/${value}`;
};

const getWebsiteUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `https://${value}`;
};

export default function ProfileDashboardClient({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.image || user?.avatarUrl || user?.avatar || "");
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    github: user?.socialLinks?.github || "",
    linkedin: user?.socialLinks?.linkedin || "",
    website: user?.socialLinks?.website || "",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Invalid file type. Allowed: JPG, PNG, WEBP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Max size: 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result);
      setImgError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
        setPreview(null);
        setUser(prev => ({ ...prev, avatarUrl: data.url }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "" }),
      });
      const data = await res.json();
      if (data.user) {
        setAvatarUrl("");
        setUser(prev => ({ ...prev, avatarUrl: "" }));
      }
    } catch (error) {
      console.error("Failed to remove avatar:", error);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          website: formData.website
        }
      };

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setIsEditing(false);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const displayAvatar = preview || avatarUrl;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Profile Settings</h1>
            <p className="text-slate-400 mt-2">Manage your personal information and preferences.</p>
          </div>
          <Button
            variant={isEditing ? "secondary" : "primary"}
            className={!isEditing ? "btn-neon bg-white/5 border-0 hover:border-0" : "border-white/10"}
            onClick={() => {
              if (isEditing) {
                // reset form if cancelled
                setFormData({
                  name: user?.name || "",
                  bio: user?.bio || "",
                  skills: user?.skills?.join(", ") || "",
                  github: user?.socialLinks?.github || "",
                  linkedin: user?.socialLinks?.linkedin || "",
                  website: user?.socialLinks?.website || "",
                });
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? (
              <span className="flex items-center gap-2"><X className="w-4 h-4" /> Cancel</span>
            ) : (
              <span className="flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Profile</span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Avatar Section */}
          <div className="col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl flex flex-col items-center sticky top-28">
              <div className="relative group">
                <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-xl group-hover:blur-2xl transition duration-500 opacity-50"></div>
                {displayAvatar && !imgError ? (
                  <img
                    src={displayAvatar}
                    alt="Avatar"
                    className="w-40 h-40 rounded-full object-cover border-4 border-slate-800 shadow-lg relative z-10"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center border-4 border-slate-800 shadow-lg relative z-10">
                    <span className="text-5xl font-bold text-white shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                {(isEditing || preview) && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-12 h-12 bg-neon-cyan rounded-full flex items-center justify-center text-black hover:bg-neon-cyan/80 transition transform hover:scale-105 shadow-lg shadow-neon-cyan/30 z-20"
                    title="Upload avatar"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview && (
                <div className="mt-6 flex gap-3 w-full justify-center">
                  <Button className="flex-1" onClick={handleUpload} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Upload className="w-4 h-4 mr-2" /> Save</>}
                  </Button>
                  <Button variant="secondary" onClick={cancelPreview} className="!px-3">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {!preview && displayAvatar && isEditing && (
                <button
                  onClick={handleRemoveAvatar}
                  className="mt-6 text-sm text-red-400 hover:text-red-300 transition font-medium underline-offset-4 hover:underline"
                >
                  Remove current avatar
                </button>
              )}

              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Shield className="w-5 h-5 text-neon-violet" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Account Role</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Mail className="w-5 h-5 text-neon-cyan" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email Address</p>
                    <p className="font-medium truncate" title={user?.email}>{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Form Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl h-full">
              {!isEditing ? (
                // View Mode
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-2">Personal Information</h3>
                    <div className="flex items-end gap-4 mb-4">
                      <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                    </div>
                    {user?.bio ? (
                      <p className="text-slate-300 text-lg leading-relaxed">{user.bio}</p>
                    ) : (
                      <p className="text-slate-500 italic">No bio provided.</p>
                    )}
                  </div>

                  <hr className="border-white/10" />

                  <div>
                    <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-4">Skills</h3>
                    {user?.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span key={index} className="px-4 py-1.5 rounded-full bg-white/10 text-slate-200 border border-white/10 text-sm font-medium hover:bg-white/20 hover:border-neon-cyan/50 transition cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No skills added yet.</p>
                    )}
                  </div>

                  <hr className="border-white/10" />

                  <div>
                    <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-4">Social Links</h3>
                    <div className="space-y-3">
                      {user?.socialLinks?.github ? (
                        <a href={getGithubUrl(user.socialLinks.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition w-fit group">
                          <Github className="w-5 h-5 group-hover:text-neon-cyan transition" />
                          <span>{user.socialLinks.github}</span>
                        </a>
                      ) : <p className="text-slate-500 italic text-sm flex items-center gap-2"><Github className="w-4 h-4" /> Not connected</p>}

                      {user?.socialLinks?.linkedin ? (
                        <a href={getLinkedinUrl(user.socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition w-fit group">
                          <Linkedin className="w-5 h-5 group-hover:text-neon-cyan transition" />
                          <span>{user.socialLinks.linkedin}</span>
                        </a>
                      ) : <p className="text-slate-500 italic text-sm flex items-center gap-2"><Linkedin className="w-4 h-4" /> Not connected</p>}

                      {user?.socialLinks?.website ? (
                        <a href={getWebsiteUrl(user.socialLinks.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition w-fit group">
                          <Globe className="w-5 h-5 group-hover:text-neon-cyan transition" />
                          <span>{user.socialLinks.website}</span>
                        </a>
                      ) : <p className="text-slate-500 italic text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Not connected</p>}
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition resize-none"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition"
                      placeholder="e.g. React, Node.js, UI/UX Design"
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <h3 className="text-sm font-medium text-slate-300 border-b border-white/10 pb-2">Social Links</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                          type="text"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition"
                          placeholder="GitHub URL or username"
                        />
                      </div>

                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                          type="text"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition"
                          placeholder="LinkedIn URL"
                        />
                      </div>

                      <div className="relative md:col-span-2">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition"
                          placeholder="Personal Website URL"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">

                    <Button
                      className="btn-neon min-w-[120px]"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
