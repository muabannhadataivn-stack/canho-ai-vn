"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ContactModal } from "./ContactModal";

interface ContactModalContextValue {
  openContactModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

// Dùng bởi DetailTabsNav (tab "Tư vấn") và StickyCTA (nút cố định phía dưới) — 2 nơi cùng
// mở 1 modal duy nhất, dùng chung đúng 1 state thay vì mỗi nơi tự quản lý riêng.
export function useContactModal(): ContactModalContextValue {
  const ctx = useContext(ContactModalContext);
  if (!ctx) throw new Error("useContactModal() phải được gọi bên trong ContactModalProvider");
  return ctx;
}

export function ContactModalProvider({
  projectId,
  projectName,
  children,
}: {
  projectId: string;
  projectName: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ContactModalContext.Provider value={{ openContactModal: () => setOpen(true) }}>
      {children}
      {open && <ContactModal projectId={projectId} projectName={projectName} onClose={() => setOpen(false)} />}
    </ContactModalContext.Provider>
  );
}
