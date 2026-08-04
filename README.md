# canho.ai.vn — Next.js frontend (giai đoạn 1: dữ liệu mock)

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

> **Lưu ý về môi trường dựng code này**: sandbox dùng để viết project không có kết nối
> mạng ra ngoài (không truy cập được registry.npmjs.org), nên `npm install` / `next build` /
> `tsc --noEmit` đầy đủ **chưa được chạy thật** ở đây. Đã kiểm tra thay thế bằng:
> - Parse cú pháp TypeScript/TSX toàn bộ file bằng TypeScript compiler (không phát hiện lỗi cú pháp).
> - Đối chiếu thủ công mọi import `@/...` với file thực tế trên đĩa (khớp 100%).
> - Rà thủ công các class Tailwind có width cố định (không thấy width cố định nào có thể
>   gây tràn ngang ở 375–390px; các hàng ngang dùng `overflow-x-auto`).
> Vui lòng chạy `npm install && npm run typecheck && npm run build` ở máy có mạng trước khi
> deploy — đây là bước bắt buộc còn thiếu, không nên coi là đã hoàn tất.

## Cấu trúc chính

- `src/app/(tabs)/*` — 4 tab chính: Khám phá (`/`), Khu vực (`/khu-vuc`), So sánh (`/so-sanh`), Đã lưu (`/da-luu`)
- `src/app/tim-kiem`, `/tim-kiem/bo-loc`, `/muc-gia/[tier]`, `/ban-do` — màn phụ có back
- `src/app/can-ho/[tinh]/[slug]` — trang chi tiết dự án, SSG (`generateStaticParams` chỉ lấy `published`)
- `src/lib/data-source.ts` — lớp trừu tượng dữ liệu; thay bằng API/DB thật tại đây khi nối pipeline
- `src/data/projects.seed.ts` — dữ liệu mock, có `publicationStatus: "draft" | "published"`
- `src/lib/jsonld.ts` + `src/lib/faq-bank.ts` — sinh JSON-LD và FAQ hiển thị từ **cùng một hàm nguồn**

## Placeholder / chưa có backend thật (cố ý, theo phạm vi đã chốt)

- Form "Gửi thông tin dự án" và "Liên hệ": không gửi đi đâu, hiện rõ thông báo chưa kết nối backend.
- "Thông báo": dữ liệu mẫu có nhãn "Dữ liệu minh hoạ".
- "Bản đồ": canvas placeholder tự dàn vị trí ghim minh hoạ, không gọi dịch vụ bản đồ trả phí.
- "Đã lưu" / "So sánh": localStorage phía client, có version + try/catch, không đồng bộ tài khoản.
- Ảnh dự án: raster thật `public/images/project-fallback.webp` (dựng từ SVG nguồn bằng sharp,
  không phải SVG/CSS-background inline trong trang) dùng khi `heroImage` là `null`.
