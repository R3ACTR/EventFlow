"use client";

import React, { useRef, useState, useEffect } from "react";
import { Search, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/common/Button";
import useFocusTrap from "@/components/common/useFocusTrap";
import { handleArrowListKeyDown } from "@/components/common/keyboardNavigation";
import { Analytics } from "@/lib/analytics";

interface Judge {
  _id: string;
  name: string;
  email: string;
}

interface OrganizerJudgeManagerProps {
  event: {
    _id: string;
    title: string;
  };
  onClose: () => void;
}

const OrganizerJudgeManager: React.FC<OrganizerJudgeManagerProps> = ({ event, onClose }) => {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [assignedJudges, setAssignedJudges] = useState<Judge[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    isOpen: true,
    containerRef: modalRef,
    onClose,
    initialFocusRef: searchInputRef,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAssignedJudges = async () => {
      try {
        const res = await fetch(`/api/events/${event._id}/judges`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setAssignedJudges(data.judges || []);
        }
      } catch (error) {
        console.error("Error fetching assigned judges:", error);
      }
    };

    fetchAssignedJudges();
    return () => { isMounted = false; };
  }, [event._id]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const assignJudge = async (judgeId: string) => {
    try {
      const res = await fetch(`/api/events/${event._id}/judges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgeId }),
      });

      if (res.ok) {
        Analytics.trackJudgeAssigned(judgeId, event._id);
        // Refresh assigned judges
        const refreshRes = await fetch(`/api/events/${event._id}/judges`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAssignedJudges(data.judges || []);
        }
        setSearchQuery("");
        setJudges([]);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to assign judge");
      }
    } catch (error) {
      console.error("Error assigning judge:", error);
    }
  };

  const removeJudge = async (judgeId: string) => {
    if (!confirm("Are you sure you want to remove this judge?")) return;

    try {
      const res = await fetch(`/api/events/${event._id}/judges`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgeId }),
      });

      if (res.ok) {
        Analytics.trackJudgeRemoved(judgeId, event._id);
        setAssignedJudges(prev => prev.filter(j => j._id !== judgeId));
      }
    } catch (error) {
      console.error("Error removing judge:", error);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-judges-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 id="assign-judges-title" className="text-2xl font-bold text-slate-900">Manage Judges</h2>
            <p className="text-slate-500 text-sm mt-1">Assign judges to {event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all" aria-label="Close dialog">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Search Judges</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && resultsRef.current) {
                  const firstButton = resultsRef.current.querySelector("button:not([disabled])") as HTMLButtonElement;
                  if (firstButton) {
                    firstButton.focus();
                    e.preventDefault();
                  }
                }
              }}
              ref={searchInputRef}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-black outline-none"
              placeholder="Search by name or email..."
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {judges.length > 0 && (
            <div
              ref={resultsRef}
              className="mt-3 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto shadow-lg bg-white overflow-hidden"
              onKeyDown={(e) => handleArrowListKeyDown(e, "button:not([disabled])")}
              role="listbox"
              aria-label="Judge search results"
            >
              {judges.map((judge) => (
                <div key={judge._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{judge.name}</p>
                    <p className="text-sm text-slate-500">{judge.email}</p>
                  </div>
                  <button
                    onClick={() => assignJudge(judge._id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    disabled={assignedJudges.some(aj => aj._id === judge._id)}
                    role="option"
                  >
                    {assignedJudges.some(aj => aj._id === judge._id) ? (
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Assigned</span>
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            Assigned Judges 
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {assignedJudges.length}
            </span>
          </h3>
          {assignedJudges.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No judges assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {assignedJudges.map((judge) => (
                <div key={judge._id} className="p-4 bg-white rounded-xl flex items-center justify-between border border-slate-100 hover:border-slate-200 shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {judge.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{judge.name}</p>
                      <p className="text-xs text-slate-500">{judge.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeJudge(judge._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Remove judge"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="px-8 py-2.5 rounded-xl font-bold">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerJudgeManager;
