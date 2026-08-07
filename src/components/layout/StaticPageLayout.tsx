import type { ReactNode } from "react";
import { BackHeader } from "./BackHeader";

export function StaticPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-paper">
      <BackHeader title={title} />
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div
          className={[
            "mx-auto max-w-2xl space-y-4 text-[14px] leading-relaxed text-graphite/80",
            // Định dạng chung cho nội dung dạng văn bản pháp lý dài (chính sách/điều khoản) —
            // heading, danh sách, bảng, trích dẫn — tập trung style ở đây để mọi trang tĩnh
            // dùng chung layout này đều nhất quán, không phải lặp lại class ở từng trang.
            "[&_h2]:mt-5 [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:text-ink [&_h2]:first:mt-0",
            "[&_h3]:mt-3 [&_h3]:text-[14.5px] [&_h3]:font-bold [&_h3]:text-ink",
            "[&_p]:mt-2",
            "[&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
            "[&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
            "[&_strong]:font-semibold [&_strong]:text-ink",
            "[&_a]:text-blueprint [&_a]:font-medium",
            "[&_table]:w-full [&_table]:border-collapse [&_table]:text-[12.5px]",
            "[&_th]:border [&_th]:border-line [&_th]:bg-paper-dim [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink",
            "[&_td]:border [&_td]:border-line [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:align-top",
            "[&_blockquote]:rounded-xl [&_blockquote]:border [&_blockquote]:border-gold/40 [&_blockquote]:bg-gold/5 [&_blockquote]:p-3 [&_blockquote]:text-[12.5px] [&_blockquote]:text-graphite/70",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
