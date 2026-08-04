"use client";

/**
 * State phía client cho "Đã lưu" — chỉ localStorage, KHÔNG có backend, KHÔNG đồng bộ tài khoản.
 * Có version cho cấu trúc lưu trữ để có thể migrate/xoá an toàn nếu đổi format sau này.
 */

const STORAGE_KEY = "canho-ai-vn:saved-projects";
const STORAGE_VERSION = 1;

interface SavedProjectsPayload {
  version: number;
  projectIds: string[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRaw(): SavedProjectsPayload {
  if (!isBrowser()) return { version: STORAGE_VERSION, projectIds: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: STORAGE_VERSION, projectIds: [] };
    const parsed = JSON.parse(raw) as Partial<SavedProjectsPayload>;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.projectIds)) {
      // Version không khớp hoặc dữ liệu hỏng — reset an toàn, không throw ra ngoài.
      return { version: STORAGE_VERSION, projectIds: [] };
    }
    return { version: STORAGE_VERSION, projectIds: parsed.projectIds };
  } catch {
    return { version: STORAGE_VERSION, projectIds: [] };
  }
}

function writeRaw(payload: SavedProjectsPayload): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage đầy / bị chặn (chế độ riêng tư...) — bỏ qua, không làm crash UI.
  }
}

export function getSavedProjectIds(): string[] {
  return readRaw().projectIds;
}

export function isProjectSaved(projectId: string): boolean {
  return readRaw().projectIds.includes(projectId);
}

export function toggleSavedProject(projectId: string): string[] {
  const current = readRaw();
  const exists = current.projectIds.includes(projectId);
  const next = exists
    ? current.projectIds.filter((id) => id !== projectId)
    : [...current.projectIds, projectId];
  writeRaw({ version: STORAGE_VERSION, projectIds: next });
  return next;
}

export const SAVED_PROJECTS_EVENT = "canho-ai-vn:saved-projects-changed";

export function notifySavedProjectsChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(SAVED_PROJECTS_EVENT));
}
