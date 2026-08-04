import type { ReactNode } from "react";
import { BackHeader } from "./BackHeader";

export function StaticPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-paper">
      <BackHeader title={title} />
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-2xl space-y-4 text-[14px] leading-relaxed text-graphite/80 [&_h2]:mt-5 [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:text-ink [&_h2]:first:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
