import type { Config } from "tailwindcss";

// Design tokens lấy nguyên từ duan-ai-vn-18-screens.html — nguồn hình ảnh chuẩn duy nhất.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12233B", // navy — nền/chữ chính
        blueprint: "#2C5F8A",
        "blueprint-light": "#5C89AC",
        paper: "#F7F5EF",
        "paper-dim": "#EEEAE0",
        gold: "#B8842B", // CTA + trạng thái active
        "gold-dark": "#946A20",
        red: "#C1432E", // chỉ dùng cho cảnh báo/lỗi — KHÔNG dùng làm CTA chính
        green: "#3E7A4C",
        graphite: "#242320",
        line: "#D8D3C7",
        canvas: "#E7E2D8",
        // Chợ Cư Dân — tông xanh rêu riêng biệt (KHÔNG dùng gold, để phân biệt rõ đây là
        // thương hiệu liên kết khác, không phải CTA chính của canho.ai.vn).
        community: "#1F6F5C",
        "community-badge-bg": "#DCEAE5",
        "community-tagline": "#5C7A73",
        "community-tag-border": "#D3E4DE",
        "community-tag-text": "#1A2E29",
        "community-tag-icon-bg": "#EAF3F0",
      },
      fontFamily: {
        // next/font (Google Fonts self-host) sinh CSS variable trong layout.tsx.
        sans: ["var(--font-sans)", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "Roboto Condensed", "sans-serif"],
        mono: ["var(--font-mono)", "Roboto Mono", "monospace"],
      },
      borderRadius: {
        phone: "38px",
      },
    },
  },
  plugins: [],
};

export default config;
