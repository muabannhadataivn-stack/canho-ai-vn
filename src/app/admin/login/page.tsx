"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-dim px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h1 className="mb-5 font-display text-[19px] font-bold text-ink">Đăng nhập quản trị</h1>

        <label className="mb-3 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">Mật khẩu</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
          />
        </label>

        {error && <p className="mb-4 text-[13px] text-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper transition-opacity disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
