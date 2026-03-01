"use client";

import { useEffect, useState } from "react";

export default function GlobalAnnouncements() {
 const [announcements, setAnnouncements] = useState([
  { _id: "1", title: "Test Announcement", message: "Feature working 🎉" }
]);


  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    }

    fetchAnnouncements();
  }, []);

  if (!announcements.length) return null;

  return (
    <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 text-sm" suppressHydrationWarning>
      {announcements.map((a) => (
        <div key={a._id} className="mb-1" suppressHydrationWarning>
          <strong>{a.title}</strong>: {a.message}
        </div>
      ))}
    </div>
  );
}
