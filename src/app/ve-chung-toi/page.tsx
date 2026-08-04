import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = { title: "Về chúng tôi" };

export default function VeChungToiPage() {
  return (
    <StaticPageLayout title="Về chúng tôi">
      <h2>canho.ai.vn là gì?</h2>
      <p>
        Nền tảng dữ liệu dự án bất động sản toàn quốc, tổng hợp từ nguồn công khai và xử lý bằng AI
        để chuẩn hoá về một định dạng dễ tra cứu.
      </p>
      <h2>Cách chúng tôi làm việc</h2>
      <p>
        Quét định kỳ các cổng thông tin quy hoạch, đầu tư công khai của từng tỉnh thành, trích xuất
        dữ liệu và chuẩn hoá thành hồ sơ dự án có cấu trúc.
      </p>
    </StaticPageLayout>
  );
}
