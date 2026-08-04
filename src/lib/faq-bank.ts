import type { ProjectWithTier } from "./types";

export interface FaqEntry {
  question: string;
  answer: string;
}

const SALES_STATUS_ANSWER: Record<ProjectWithTier["salesStatus"], string> = {
  "sap-mo-ban": "chưa mở bán, đang trong giai đoạn chuẩn bị.",
  "dang-mo-ban": "đang trong giai đoạn mở bán.",
  "da-ban-giao": "đã bàn giao. Thông tin trên trang phục vụ tra cứu thị trường thứ cấp và theo dõi tiện ích/tiến độ.",
  "dang-cap-nhat": "chưa xác định được trạng thái mở bán tại thời điểm cập nhật gần nhất — dữ liệu đang được rà soát lại.",
};

/**
 * DATA-SCHEMA mục 7: mỗi câu chỉ đưa vào nếu dữ liệu nguồn tồn tại.
 * Không viết tay tự do cho từng dự án — sinh động từ object dữ liệu.
 * Đây là NGUỒN DUY NHẤT cho cả FAQ hiển thị lẫn FAQPage JSON-LD (lib/jsonld.ts gọi lại hàm này).
 */
export function buildFaqEntries(project: ProjectWithTier): FaqEntry[] {
  const entries: FaqEntry[] = [];
  const { name, province } = project;

  // 1. Luôn hiện — dùng salesStatus
  entries.push({
    question: `${name} đã bàn giao chưa?`,
    answer: `Theo dữ liệu cập nhật gần nhất, ${name} ${SALES_STATUS_ANSWER[project.salesStatus]}`,
  });

  // 2. Chỉ hiện nếu có priceMin
  if (project.pricing.priceMin !== undefined) {
    const unit = project.pricing.priceUnit === "ty-can" ? "tỷ/căn" : "triệu/m²";
    const max = project.pricing.priceMax;
    const priceText = max
      ? `khoảng ${project.pricing.priceMin}–${max} ${unit}`
      : `khoảng ${project.pricing.priceMin} ${unit}`;
    entries.push({
      question: `Giá ${name} hiện nay khoảng bao nhiêu?`,
      answer: `Giá tham khảo ${priceText}. Đây là giá tham khảo tại thời điểm cập nhật, có thể thay đổi theo thời điểm giao dịch thực tế.`,
    });
  }

  // 3. Chỉ hiện nếu có commuteNote hoặc nearbyRoutes
  const hasCommuteInfo =
    !!project.location.commuteNote ||
    (project.location.nearbyRoutes && project.location.nearbyRoutes.length > 0);
  if (hasCommuteInfo) {
    const answer = project.location.commuteNote
      ? project.location.commuteNote
      : `${name} kết nối với trung tâm ${province} qua các tuyến giao thông chính trong khu vực.`;
    entries.push({
      question: `${name} cách trung tâm ${province} bao xa?`,
      answer,
    });
  }

  // 4. Luôn hiện — sinh theo propertyType + khu vực
  entries.push({
    question: `${name} có phù hợp đầu tư cho thuê không?`,
    answer: `Là dự án căn hộ chung cư tại ${province}, khả năng cho thuê phụ thuộc vào vị trí, tiện ích lân cận và mức giá tại từng thời điểm — nên tham khảo mục Vị trí và Tiện ích trên trang để đánh giá cụ thể.`,
  });

  // 5. Chỉ hiện nếu amenities có ít nhất 1 item
  if (project.amenities.length > 0) {
    const topAmenities = project.amenities.slice(0, 3).map((a) => a.name).join(", ");
    entries.push({
      question: `Tiện ích nổi bật nhất của ${name} là gì?`,
      answer: `Một số tiện ích nội khu đáng chú ý gồm ${topAmenities}. Xem đầy đủ tại mục Tiện ích trên trang.`,
    });
  }

  return entries;
}
