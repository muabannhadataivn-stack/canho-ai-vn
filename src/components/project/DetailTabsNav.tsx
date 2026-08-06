"use client";

import { useEffect, useState } from "react";
import { useContactModal } from "./ContactModalProvider";

interface ScrollTab {
  id: string;
  label: string;
}

// "Tổng quan" (section-tong-quan) và "Vị trí" (section-vi-tri) LUÔN render vô điều kiện
// trên trang chi tiết. "Giá" (section-gia) chỉ render khi hasPricingData(project) đúng —
// nhận qua prop showGia, nếu không tab sẽ trỏ tới anchor không tồn tại trong DOM (đã từng
// xảy ra thật với tab "Tiến độ" cũ khi dự án không có project_timeline).
export function DetailTabsNav({ showGia }: { showGia: boolean }) {
  const { openContactModal } = useContactModal();

  const scrollTabs: ScrollTab[] = [
    { id: "section-tong-quan", label: "Tổng quan" },
    { id: "section-vi-tri", label: "Vị trí" },
    ...(showGia ? [{ id: "section-gia", label: "Giá" }] : []),
  ];

  const [active, setActive] = useState(scrollTabs[0]!.id);

  useEffect(() => {
    const elements = scrollTabs.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGia]);

  return (
    <nav className="sticky top-0 z-10 flex gap-1 border-b border-line bg-paper/95 px-3 py-2 backdrop-blur">
      {scrollTabs.map((tab) => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
            active === tab.id ? "bg-ink text-paper" : "text-ink/50"
          }`}
        >
          {tab.label}
        </a>
      ))}
      {/* "Tư vấn" LUÔN hiện, KHÔNG cuộn tới section nào — mở ContactModal (dùng chung state
          với nút StickyCTA qua ContactModalProvider), nên là <button>, không phải <a href>. */}
      <button
        type="button"
        onClick={openContactModal}
        className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-gold transition-colors hover:text-gold-dark"
      >
        Tư vấn
      </button>
    </nav>
  );
}
