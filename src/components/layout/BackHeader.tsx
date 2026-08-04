import type { ReactNode } from "react";
import { BackButton } from "./BackButton";

export function BackHeader({
  title,
  action,
  showBack = true,
}: {
  title: string;
  action?: ReactNode;
  showBack?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 bg-ink px-4 py-4 text-paper">
      {showBack && <BackButton />}
      <h1 className="flex-1 font-display text-[17px] font-bold">{title}</h1>
      {action}
    </div>
  );
}
