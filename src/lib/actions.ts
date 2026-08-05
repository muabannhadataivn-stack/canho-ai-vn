"use server";

import { getAllPublishedForCompare } from "./data-source";
import type { ProjectWithTier } from "./types";

/**
 * Cầu nối duy nhất cho phép client component ("Đã lưu", "So sánh") lấy dữ liệu project
 * đầy đủ từ Supabase dựa trên khoá "{provinceSlug}:{slug}" đọc từ localStorage (xem saved-projects.ts).
 * Không import data-source.ts / supabase-server.ts trực tiếp vào client component.
 */
export async function fetchComparedProjects(projectKeys: string[]): Promise<ProjectWithTier[]> {
  return getAllPublishedForCompare(projectKeys);
}
