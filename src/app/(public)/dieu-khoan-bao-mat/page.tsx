import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = { title: "Điều khoản & Bảo mật" };

export default function DieuKhoanBaoMatPage() {
  return (
    <StaticPageLayout title="Điều khoản & Bảo mật">
      <h2>Điều khoản sử dụng</h2>
      <p>
        Thông tin trên canho.ai.vn mang tính chất tham khảo, tổng hợp từ nguồn công khai. Người dùng
        nên đối chiếu với chủ đầu tư trước khi giao dịch.
      </p>
      <h2>Chính sách bảo mật</h2>
      <p>Thông tin liên hệ chỉ dùng để phản hồi yêu cầu liên quan, không chia sẻ cho bên thứ ba.</p>
    </StaticPageLayout>
  );
}
