/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ảnh đại diện (hero image) dự án upload lên Supabase Storage bucket "project-images"
    // (xem admin-actions.ts saveHeroImage()) — next/image chặn domain lạ mặc định, phải khai
    // báo tường minh đúng project Supabase này mới render được.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hegblprvlmtoodfvrpkj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Mặc định 1mb — CSV nhập hàng loạt (~1842 dòng, 2 file) từ /admin/du-an/nhap-csv
    // có thể vượt mốc đó khi gửi thẳng nội dung file qua Server Action.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      // Đổi URL trang chi tiết dự án từ /can-ho/{tinh}/{slug} sang /{tinh}/{slug} (bỏ tiền tố
      // "can-ho" — domain chỉ phục vụ đúng 1 loại hình). 301 để giữ SEO đã tích luỹ cho các
      // trang Google đã index (Hinode City, Vinhomes Central Park, Akari City...).
      {
        source: "/can-ho/:tinh/:slug",
        destination: "/:tinh/:slug",
        permanent: true,
      },
      // Đổi URL danh mục tỉnh từ /khu-vuc/{tinh} sang /{tinh} (bỏ tiền tố "khu-vuc", cùng lý do
      // như trên) — /khu-vuc (không có :tinh, trang liệt kê mọi tỉnh) GIỮ NGUYÊN, không đổi.
      {
        source: "/khu-vuc/:tinh",
        destination: "/:tinh",
        permanent: true,
      },
      // /dieu-khoan-bao-mat (trang gộp cũ, nội dung sơ sài) đã tách thành 2 trang đầy đủ:
      // /chinh-sach-bao-mat và /dieu-khoan-su-dung. Redirect về trang bao quát nhất
      // (chính sách bảo mật) để bảo toàn SEO cho URL cũ nếu đã được index.
      {
        source: "/dieu-khoan-bao-mat",
        destination: "/chinh-sach-bao-mat",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
