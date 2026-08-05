import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
