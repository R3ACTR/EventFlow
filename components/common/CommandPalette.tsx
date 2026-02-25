"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Command } from "lucide-react";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  href: string;
  roles?: string[];
  keywords?: string[];
};

const DEFAULT_SHORTCUT = "Ctrl/Cmd + K";

function isTextInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  const editable = target.isContentEditable;
  return editable || tag === "input" || tag === "textarea" || tag === "select";
}

export default function CommandPalette() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const role = session?.user?.role || null;

  const items = useMemo<CommandItem[]>(() => {
    const dashboardHref = role ? `/${role}` : "/login";
    const eventsHref = role === "organizer" ? "/organizer/events" : "/events";
    const submissionsHref =
      role === "judge" ? "/judge" :
      role === "mentor" ? "/mentor" :
      role === "participant" ? "/participant" :
      role === "organizer" ? "/organizer" :
      "/events";
    const teamsHref =
      role === "mentor" ? "/mentor" :
      role === "participant" ? "/participant" :
      role === "organizer" ? "/organizer" :
      "/events";

    return [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Jump to your main workspace",
        href: dashboardHref,
        keywords: ["home", "workspace", "overview"],
      },
      {
        id: "events",
        label: "Events",
        description: role === "organizer" ? "Manage your events" : "Browse upcoming events",
        href: eventsHref,
        keywords: ["schedule", "hackathon", "browse"],
      },
      {
        id: "teams",
        label: "Teams",
        description: "View or manage teams",
        href: teamsHref,
        roles: ["participant", "mentor", "organizer"],
        keywords: ["members", "groups", "collaboration"],
      },
      {
        id: "submissions",
        label: "Submissions",
        description: "Review or track project submissions",
        href: submissionsHref,
        roles: ["participant", "mentor", "judge", "organizer"],
        keywords: ["projects", "reviews", "entries"],
      },
      {
        id: "admin-tools",
        label: "Admin Tools",
        description: "System settings and user management",
        href: "/admin",
        roles: ["admin"],
        keywords: ["settings", "management", "controls"],
      },
    ];
  }, [role]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const roleFiltered = items.filter((item) => {
      if (!item.roles) return true;
      if (!role) return false;
      return item.roles.includes(role);
    });

    if (!normalizedQuery) return roleFiltered;

    return roleFiltered.filter((item) => {
      const haystack = [
        item.label,
        item.description || "",
        ...(item.keywords || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, query, role]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextInput(event.target)) return;
      const isCmd = event.metaKey;
      const isCtrl = event.ctrlKey;
      const isK = event.key.toLowerCase() === "k";
      if ((isCmd || isCtrl) && isK) {
        event.preventDefault();
        setIsOpen((open) => !open);
        return;
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-wide text-slate-300 backdrop-blur-lg transition hover:border-neon-cyan/40 hover:text-neon-cyan"
        aria-label="Open command palette"
      >
        <Command className="h-4 w-4" />
        Command Palette
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
          {DEFAULT_SHORTCUT}
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global command palette"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-space-900/95 shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search destinations or actions..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            aria-label="Search commands"
          />
          <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
            {DEFAULT_SHORTCUT}
          </span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {visibleItems.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-400">
              No matches. Try a different keyword.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.href)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left transition hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-400">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      Go
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] text-slate-500">
          <span>Role-aware shortcuts</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
