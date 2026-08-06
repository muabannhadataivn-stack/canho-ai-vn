"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { submitContactRequest } from "@/lib/contact-actions";

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const CLOSE_DELAY_MS = 2000;

interface ContactModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function ContactModal({ projectId, projectName, onClose }: ContactModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsEmail, setWantsEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const phoneTrimmed = phone.trim();
  const phoneInvalid = phoneTrimmed !== "" && !VN_PHONE_REGEX.test(phoneTrimmed);
  const canSubmit =
    fullName.trim() !== "" &&
    phoneTrimmed !== "" &&
    !phoneInvalid &&
    (!wantsEmail || email.trim() !== "") &&
    consent &&
    !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("fullName", fullName.trim());
    formData.set("phone", phoneTrimmed);
    formData.set("wantsEmailReport", wantsEmail ? "true" : "false");
    if (wantsEmail) formData.set("email", email.trim());

    const result = await submitContactRequest(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Có lỗi xảy ra, thử lại.");
      return;
    }

    setSuccess(true);
    setTimeout(onClose, CLOSE_DELAY_MS);
  }

  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-paper p-5 sm:rounded-3xl"
        onClick={stopPropagation}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[13px] font-bold text-blueprint">canho.ai.vn</span>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-[20px] leading-none text-graphite/50">
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="mb-2 text-[34px] text-green">✓</div>
            <p className="font-display text-[16px] font-bold text-ink">Cảm ơn bạn!</p>
            <p className="mt-1 text-[13px] text-graphite/60">Chúng tôi đã ghi nhận yêu cầu, sẽ liên hệ sớm nhất.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="mb-1 font-display text-[18px] font-bold text-ink">Nhận thông tin dự án</h2>
            <p className="mb-3 text-[13px] text-graphite/60">Nhận bảng giá mới nhất và thông tin chi tiết.</p>
            <div className="mb-4 rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] text-ink">
              Dự án: <span className="font-semibold">{projectName}</span>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-[13px] font-medium text-graphite">Họ và tên *</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
              />
            </label>

            <label className="mb-1 block">
              <span className="mb-1 block text-[13px] font-medium text-graphite">Số điện thoại *</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
              />
            </label>
            <p className={`mb-3 text-[12px] ${phoneInvalid ? "text-red" : "text-transparent"}`}>
              Số điện thoại không đúng định dạng Việt Nam.
            </p>

            <label className="mb-2 flex items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={wantsEmail} onChange={(e) => setWantsEmail(e.target.checked)} />
              Tôi muốn nhận thông tin qua email
            </label>

            {wantsEmail && (
              <label className="mb-3 block">
                <span className="mb-1 block text-[13px] font-medium text-graphite">Email *</span>
                <input
                  type="email"
                  required={wantsEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
                />
              </label>
            )}

            <label className="mb-4 flex items-start gap-2 text-[12px] leading-relaxed text-graphite/70">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span>Tôi đồng ý để canho.ai.vn liên hệ tư vấn về dự án này qua số điện thoại/email đã cung cấp.</span>
            </label>

            {error && <p className="mb-3 text-[13px] text-red">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-gold px-4 py-3 text-[14px] font-bold text-ink transition-opacity disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "NHẬN TƯ VẤN NGAY"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
