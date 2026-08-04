import type { ReactNode } from "react";

export function SpecBlock({
  number,
  title,
  id,
  children,
}: {
  number: number;
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-4 pt-5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-ink text-[9.5px] text-paper">
          {number}
        </span>
        <h2 className="font-display text-[15px] font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
