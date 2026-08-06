"use server";

import { supabaseServer } from "./supabase-server";

/**
 * Server Action CÔNG KHAI — gọi từ modal "Đăng ký tư vấn" trên trang chi tiết dự án, không
 * qua middleware admin. Dùng supabaseServer (service_role) vì chưa có policy anon nào cho
 * contact_requests (RLS deny mặc định, xem migration) — an toàn vì insert luôn đi qua validate
 * server-side dưới đây, không có đường nào ghi thẳng bằng anon key từ trình duyệt.
 */

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export interface ContactActionResult {
  ok: boolean;
  error?: string;
}

export async function submitContactRequest(formData: FormData): Promise<ContactActionResult> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const wantsEmailReport = String(formData.get("wantsEmailReport") ?? "") === "true";
  const email = String(formData.get("email") ?? "").trim();

  if (!projectId) return { ok: false, error: "Thiếu thông tin dự án." };
  if (!fullName) return { ok: false, error: "Vui lòng nhập họ và tên." };
  if (!VN_PHONE_REGEX.test(phone)) return { ok: false, error: "Số điện thoại không đúng định dạng." };
  if (wantsEmailReport && !email) return { ok: false, error: "Vui lòng nhập email." };

  const { error } = await supabaseServer.from("contact_requests").insert({
    project_id: projectId,
    full_name: fullName,
    phone,
    email: email || null,
    wants_email_report: wantsEmailReport,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
