/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
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
    ];
  },
};

export default nextConfig;
