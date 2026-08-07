"use server";

import { Resend } from "resend";
import { supabaseServer } from "./supabase-server";
import { SITE_URL } from "./jsonld";

/**
 * Server Action CÔNG KHAI — gọi từ modal "Đăng ký tư vấn" trên trang chi tiết dự án, không
 * qua middleware admin. Dùng supabaseServer (service_role) vì chưa có policy anon nào cho
 * contact_requests (RLS deny mặc định, xem migration) — an toàn vì insert luôn đi qua validate
 * server-side dưới đây, không có đường nào ghi thẳng bằng anon key từ trình duyệt.
 */

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const ADMIN_NOTIFY_EMAIL = "ngoquy262@gmail.com";

export interface ContactActionResult {
  ok: boolean;
  error?: string;
}

// Gửi email thông báo admin qua Resend — KHÔNG BAO GIỜ throw ra ngoài. Dữ liệu đã lưu DB
// thành công là điều quan trọng nhất; Resend lỗi (hết quota, sai key, timeout...) chỉ log
// console, khách hàng vẫn thấy luồng đăng ký tư vấn thành công bình thường.
async function notifyAdminByEmail(input: {
  fullName: string;
  phone: string;
  email: string;
  projectName: string;
  createdAt: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[submitContactRequest] Thiếu RESEND_API_KEY trong .env.local — bỏ qua gửi email thông báo.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const sentAt = new Date(input.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const html = `
      <p><strong>Có yêu cầu tư vấn mới trên canho.ai.vn</strong></p>
      <ul>
        <li>Tên khách: ${input.fullName}</li>
        <li>Số điện thoại: ${input.phone}</li>
        <li>Email: ${input.email || "(không cung cấp)"}</li>
        <li>Dự án quan tâm: ${input.projectName}</li>
        <li>Thời điểm gửi: ${sentAt}</li>
      </ul>
      <p>Xem đầy đủ tại: <a href="${SITE_URL}/admin/lien-he">${SITE_URL}/admin/lien-he</a></p>
    `;
    await resend.emails.send({
      from: "canho.ai.vn <no-reply@canho.ai.vn>",
      to: ADMIN_NOTIFY_EMAIL,
      subject: `🔔 Yêu cầu tư vấn mới — ${input.projectName}`,
      html,
    });
  } catch (e) {
    console.error("[submitContactRequest] Gửi email thông báo qua Resend thất bại:", e);
  }
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

  const { data, error } = await supabaseServer
    .from("contact_requests")
    .insert({
      project_id: projectId,
      full_name: fullName,
      phone,
      email: email || null,
      wants_email_report: wantsEmailReport,
    })
    .select("created_at, projects(name)")
    .single();
  if (error) return { ok: false, error: error.message };

  // Không để lỗi gửi email (đã tự bắt lỗi bên trong notifyAdminByEmail) ảnh hưởng tới kết quả
  // trả về cho khách hàng — record đã INSERT thành công là đủ để coi luồng chính đã ok.
  const projectName = (data.projects as unknown as { name: string } | null)?.name ?? "(không xác định)";
  await notifyAdminByEmail({ fullName, phone, email, projectName, createdAt: data.created_at as string });

  return { ok: true };
}
