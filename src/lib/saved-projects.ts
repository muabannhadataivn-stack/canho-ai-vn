"use client";

/**
 * State phía client cho "Đã lưu" — chỉ localStorage, KHÔNG có backend, KHÔNG đồng bộ tài khoản.
 * Có version cho cấu trúc lưu trữ để có thể migrate/xoá an toàn nếu đổi format sau này.
 *
 * Khoá lưu là "{provinceSlug}:{slug}" — trùng với URL /can-ho/{tinh}/{slug}, là định danh
 * công khai ổn định. KHÔNG dùng project.id (uuid nội bộ DB, có thể đổi nếu dữ liệu bị xoá/tạo lại).
 */

const STORAGE_KEY = "canho-ai-vn:saved-projects";
const STORAGE_VERSION = 2;

interface SavedProjectsPayload {
  version: number;
  projectKeys: string[];
}

export function makeProjectKey(provinceSlug: string, slug: string): string {
  return `${provinceSlug}:${slug}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRaw(): SavedProjectsPayload {
  if (!isBrowser()) return { version: STORAGE_VERSION, projectKeys: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: STORAGE_VERSION, projectKeys: [] };
    const parsed = JSON.parse(raw) as Partial<SavedProjectsPayload>;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.projectKeys)) {
      // Version không khớp (vd dữ liệu cũ theo format id) hoặc dữ liệu hỏng — reset an toàn, không throw ra ngoài.
      return { version: STORAGE_VERSION, projectKeys: [] };
    }
    return { version: STORAGE_VERSION, projectKeys: parsed.projectKeys };
  } catch {
    return { version: STORAGE_VERSION, projectKeys: [] };
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
  return readRaw().projectKeys;
}

export function isProjectSaved(projectKey: string): boolean {
  return readRaw().projectKeys.includes(projectKey);
}

export function toggleSavedProject(projectKey: string): string[] {
  const current = readRaw();
  const exists = current.projectKeys.includes(projectKey);
  const next = exists
    ? current.projectKeys.filter((key) => key !== projectKey)
    : [...current.projectKeys, projectKey];
  writeRaw({ version: STORAGE_VERSION, projectKeys: next });
  return next;
}

export const SAVED_PROJECTS_EVENT = "canho-ai-vn:saved-projects-changed";

export function notifySavedProjectsChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(SAVED_PROJECTS_EVENT));
}
