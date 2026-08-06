import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { buildFaqEntries, type FaqEntry } from "./faq-bank";
import type { ProjectWithTier, SalesStatus } from "./types";

/**
 * Sinh nội dung AI (đoạn mở đầu + FAQ) qua Claude API — gọi 1 lần/dự án lúc admin bấm
 * Publish (xem admin-actions.ts publishProject), lưu vào project_ai_content, không gọi
 * lại cho lần publish sau nếu đã có (tiết kiệm chi phí, tránh nội dung đổi mỗi lần).
 */

// Model hiện hành, tier Sonnet — phù hợp viết nội dung ngắn nhưng vẫn cần chất lượng văn
// phong tốt cho trang công khai (không dùng "claude-sonnet-4-6", tên đó không hợp lệ).
export const AI_CONTENT_MODEL = "claude-sonnet-5";

const SALES_STATUS_LABEL: Record<SalesStatus, string> = {
  "sap-mo-ban": "Sắp mở bán",
  "dang-mo-ban": "Đang mở bán",
  "da-ban-giao": "Đã bàn giao",
  "dang-cap-nhat": "Đang cập nhật",
};

export interface GeneratedProjectContent {
  introText: string;
  faq: FaqEntry[];
}

const SYSTEM_PROMPT = `Bạn là biên tập viên nội dung cho canho.ai.vn — trang tra cứu dữ liệu dự án căn hộ chung cư công khai, KHÔNG phải trang quảng cáo bán hàng.

QUY TẮC BẮT BUỘC, không được vi phạm dưới bất kỳ hình thức nào:
1. KHÔNG đề cập, xác nhận, hay ám chỉ bất kỳ tình trạng pháp lý nào của dự án (sổ đỏ, sổ hồng, giấy phép, thế chấp, quyền sở hữu, quyền sử dụng đất, tính pháp lý, minh bạch pháp lý...). Chỉ được mô tả tiến độ triển khai thực tế: khởi công, mở bán, bàn giao.
2. KHÔNG bịa thêm bất kỳ số liệu, chi tiết, hay thông tin nào không có trong phần "DỮ LIỆU DỰ ÁN" ở tin nhắn người dùng.
3. Trả lời ĐÚNG NGUYÊN VĂN theo định dạng JSON được yêu cầu — không thêm chữ nào ngoài JSON, không bọc trong markdown code fence.`;

function buildProjectSummary(project: ProjectWithTier): string {
  const lines: string[] = [`Tên dự án: ${project.name}`, `Tỉnh/thành: ${project.province}`];
  if (project.district) lines.push(`Quận/huyện: ${project.district}`);
  if (project.developer) lines.push(`Chủ đầu tư: ${project.developer}`);
  if (project.scale) lines.push(`Quy mô: ${project.scale}`);
  if (project.units) lines.push(`Số toà: ${project.units}`);
  if (project.startDate) lines.push(`Khởi công: ${project.startDate}`);
  if (project.handoverExpected) lines.push(`Bàn giao dự kiến: ${project.handoverExpected}`);
  lines.push(`Trạng thái mở bán: ${SALES_STATUS_LABEL[project.salesStatus]}`);
  return lines.join("\n");
}

interface RawApiResponse {
  introText: string;
  faq: { question: string; answer: string }[];
}

function parseApiResponse(raw: string): RawApiResponse {
  // Claude đôi khi vẫn bọc JSON trong ```json ... ``` dù đã dặn không — bóc trước khi parse.
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  const parsed = JSON.parse(cleaned) as Partial<RawApiResponse>;
  if (typeof parsed.introText !== "string" || !Array.isArray(parsed.faq)) {
    throw new Error("Claude API trả về JSON không đúng định dạng mong đợi.");
  }
  return parsed as RawApiResponse;
}

/**
 * templateFaq (buildFaqEntries — nguồn xác định ĐÚNG câu hỏi nào áp dụng theo dữ liệu
 * có sẵn) chỉ dùng để lấy đúng bộ câu hỏi + câu trả lời mẫu làm ngữ cảnh cho AI viết lại
 * phần trả lời tự nhiên hơn. Câu hỏi giữ NGUYÊN theo templateFaq (không lấy từ AI) —
 * lớp phòng thủ để AI không thể tự đổi/thêm câu hỏi ngoài ý muốn.
 */
export async function generateProjectContent(project: ProjectWithTier): Promise<GeneratedProjectContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Thiếu ANTHROPIC_API_KEY trong .env.local");

  const templateFaq = buildFaqEntries(project);
  const anthropic = new Anthropic({ apiKey });

  const userPrompt = [
    "DỮ LIỆU DỰ ÁN:",
    buildProjectSummary(project),
    "",
    `PHẦN 1 — Viết đoạn mở đầu 100-150 từ trả lời câu hỏi "${project.name} là gì?", chỉ dựa trên dữ liệu trên. Văn phong trung lập, mang tính thông tin, KHÔNG phải giọng quảng cáo bán hàng.`,
    "",
    "PHẦN 2 — Dưới đây là các câu hỏi FAQ đã được xác định phù hợp cho dự án này (dựa theo dữ liệu có sẵn), kèm câu trả lời MẪU dạng template cứng nhắc:",
    JSON.stringify(templateFaq, null, 2),
    "Viết lại PHẦN TRẢ LỜI cho từng câu theo văn phong tự nhiên, biến hoá hơn so với bản mẫu — GIỮ NGUYÊN từng câu hỏi y hệt, GIỮ NGUYÊN đúng số lượng câu (không thêm, không bớt), chỉ dựa trên dữ liệu đã cho ở trên, không bịa thêm chi tiết.",
    "",
    'Trả về ĐÚNG JSON theo schema sau, không thêm chữ nào khác: { "introText": string, "faq": [{ "question": string, "answer": string }] }',
  ].join("\n");

  const message = await anthropic.messages.create({
    model: AI_CONTENT_MODEL,
    // 1500 trước đó không đủ — model mặc định bật extended thinking, đã ăn 1412/1500
    // token vào phần suy luận nội bộ, chỉ còn ~88 token để viết JSON thật nên bị cắt
    // cụt giữa chừng ("Unterminated string"). 8000 chừa đủ chỗ an toàn kể cả khi vẫn
    // còn thinking, hoặc khi FAQ dài hơn (nhiều câu hơn) ở các dự án khác.
    max_tokens: 8000,
    // Tắt hẳn — sinh đoạn mở đầu + viết lại câu trả lời FAQ theo mẫu có sẵn không cần
    // suy luận phức tạp, mà thinking_tokens vẫn tính phí dù không phải nội dung dùng
    // được, nên tắt vừa rẻ hơn vừa nhanh hơn, vừa tránh lặp lại đúng lỗi này về sau.
    thinking: { type: "disabled" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API không trả về nội dung text.");
  }

  const parsed = parseApiResponse(textBlock.text);

  return {
    introText: parsed.introText.trim(),
    faq: templateFaq.map((tpl, i) => ({
      question: tpl.question,
      answer: parsed.faq[i]?.answer?.trim() || tpl.answer, // fallback về câu mẫu nếu AI thiếu/rỗng
    })),
  };
}
