"use client";

import { useEffect, useState } from "react";
import {
  isProjectSaved,
  toggleSavedProject,
  notifySavedProjectsChanged,
  SAVED_PROJECTS_EVENT,
} from "@/lib/saved-projects";

export function SaveHeartButton({ projectId }: { projectId: string }) {
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(isProjectSaved(projectId));
    setHydrated(true);
    const onChange = () => setSaved(isProjectSaved(projectId));
    window.addEventListener(SAVED_PROJECTS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SAVED_PROJECTS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [projectId]);

  return (
    <button
      type="button"
      aria-label={saved ? "Bỏ lưu dự án" : "Lưu dự án"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSavedProject(projectId);
        notifySavedProjectsChanged();
        setSaved((s) => !s);
      }}
      className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[14px] shadow-sm transition-colors ${
        hydrated && saved ? "text-gold" : "text-line"
      }`}
    >
      {hydrated && saved ? "♥" : "♡"}
    </button>
  );
}
