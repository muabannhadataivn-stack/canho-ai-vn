"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ContactModal } from "./ContactModal";

interface ContactModalContextValue {
  openContactModal: () => void;
  // Lộ projectName qua context để StickyCTA (nút SMS) dùng lại — tránh phải truyền thêm prop
  // xuống qua nhiều lớp component chỉ để lấy đúng 1 giá trị đã có sẵn ở provider.
  projectName: string;
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
    <ContactModalContext.Provider value={{ openContactModal: () => setOpen(true), projectName }}>
      {children}
      {open && <ContactModal projectId={projectId} projectName={projectName} onClose={() => setOpen(false)} />}
    </ContactModalContext.Provider>
  );
}
