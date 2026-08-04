import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-canvas sm:py-6">
      <div className="flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-paper sm:h-[844px] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[32px] sm:border sm:border-line sm:shadow-2xl">
        {children}
      </div>
    </div>
  );
}
