"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import Button from "@/components/common/Button";

export default function ProfileDashboardClient({ user }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const fileInputRef = useRef(null);

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
    reader.onload = (e) => setPreview(e.target?.result);
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
      }
    } catch (error) {
      console.error("Failed to remove avatar:", error);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayAvatar = preview || avatarUrl;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-neon-cyan/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center border-4 border-neon-cyan/30">
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-neon-cyan rounded-full flex items-center justify-center text-black hover:bg-neon-cyan/80 transition shadow-lg shadow-neon-cyan/30"
                title="Upload avatar"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {preview && (
              <div className="mt-4 flex gap-3">
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button variant="secondary" onClick={cancelPreview}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            {!preview && displayAvatar && (
              <button
                onClick={handleRemoveAvatar}
                className="mt-4 text-sm text-red-400 hover:text-red-300 transition"
              >
                Remove avatar
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Name
              </label>
              <div className="text-white text-lg">{user?.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Email
              </label>
              <div className="text-white text-lg">{user?.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Role
              </label>
              <div className="text-white text-lg capitalize">{user?.role}</div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500 text-center">
          Allowed formats: JPG, PNG, WEBP • Max size: 2MB
        </p>
      </div>
    </div>
  );
}
