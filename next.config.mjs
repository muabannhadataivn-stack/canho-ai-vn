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
};

export default nextConfig;
