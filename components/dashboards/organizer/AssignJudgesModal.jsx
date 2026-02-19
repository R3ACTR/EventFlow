
"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/common/Button";

export default function AssignJudgesModal({ event, onClose }) {
  const [judges, setJudges] = useState([]);
  const [assignedJudges, setAssignedJudges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedJudges();
  }, [event._id]);

  const fetchAssignedJudges = async () => {
    try {
      const res = await fetch(`/api/events/${event._id}/judges`);
      if (res.ok) {
        const data = await res.json();
        setAssignedJudges(data.judges || []);
      }
    } catch (error) {
      console.error("Error fetching assigned judges:", error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setJudges([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${query}&role=judge`);
      if (res.ok) {
        const data = await res.json();
        setJudges(data.users || []);
      }
    } catch (error) {
      console.error("Error searching judges:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignJudge = async (judgeId) => {
    try {
      const res = await fetch(`/api/events/${event._id}/judges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgeId }),
      });

      if (res.ok) {
        fetchAssignedJudges();
        // Clear search
        setSearchQuery("");
        setJudges([]);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Error assigning judge:", error);
    }
  };

  const removeJudge = async (judgeId) => {
    if (!confirm("Are you sure you want to remove this judge?")) return;

    try {
      const res = await fetch(`/api/events/${event._id}/judges`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgeId }),
      });

      if (res.ok) {
        fetchAssignedJudges();
      }
    } catch (error) {
      console.error("Error removing judge:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Assign Judges</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Judges</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name or email..."
            />
          </div>

          {/* Search Results */}
          {judges.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {judges.map((judge) => (
                <div key={judge._id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{judge.name}</p>
                    <p className="text-xs text-slate-500">{judge.email}</p>
                  </div>
                  <button
                    onClick={() => assignJudge(judge._id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    disabled={assignedJudges.some(aj => aj._id === judge._id)}
                  >
                    {assignedJudges.some(aj => aj._id === judge._id) ? (
                        <span className="text-xs text-slate-400">Assigned</span>
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Assigned Judges ({assignedJudges.length})</h3>
          {assignedJudges.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No judges assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {assignedJudges.map((judge) => (
                <div key={judge._id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                      {judge.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{judge.name}</p>
                      <p className="text-xs text-slate-500">{judge.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeJudge(judge._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
