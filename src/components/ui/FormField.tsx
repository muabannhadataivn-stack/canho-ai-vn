import type { ReactNode } from "react";

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink/80">{label}</span>
      {children}
    </label>
  );
}

export const inputClasses =
  "rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-graphite/40 focus:border-blueprint focus:outline-none";
