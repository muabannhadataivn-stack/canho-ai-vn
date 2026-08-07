import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Đóng watermark public/images/canho-watermark.png (nền trong suốt, ~899x302px) vào góc dưới
 * phải 1 ảnh — dùng bởi mọi luồng upload ảnh dự án (Album ảnh, admin-actions.ts
 * saveGalleryImages()).
 */

const WATERMARK_PATH = path.join(process.cwd(), "public", "images", "canho-watermark.png");
const WATERMARK_MIN_IMAGE_WIDTH = 200; // ảnh gốc nhỏ hơn ngưỡng này thì bỏ watermark — che gần hết ảnh, phản tác dụng
const WATERMARK_WIDTH_RATIO = 0.22; // watermark rộng ~22% chiều rộng ảnh gốc (theo tỉ lệ, không cố định px)
const WATERMARK_MARGIN_PX = 20;

export interface WatermarkResult {
  buffer: Buffer;
  contentType: string;
}

// Giữ nguyên định dạng gốc (jpg/png/webp). Lỗi sharp (file hỏng, định dạng lạ, watermark
// thiếu...) KHÔNG được làm hỏng luồng upload gọi hàm này — bắt lỗi, log rõ, fallback về buffer
// ảnh gốc không watermark.
export async function applyWatermark(file: File): Promise<WatermarkResult> {
  const originalBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const image = sharp(originalBuffer);
    const { width, height } = await image.metadata();
    if (!width || !height) throw new Error("Không đọc được kích thước ảnh gốc.");

    if (width < WATERMARK_MIN_IMAGE_WIDTH) {
      return { buffer: originalBuffer, contentType: file.type };
    }

    const watermarkSource = await readFile(WATERMARK_PATH);
    const targetWatermarkWidth = Math.round(width * WATERMARK_WIDTH_RATIO);
    const { data: resizedWatermark, info: watermarkInfo } = await sharp(watermarkSource)
      .resize({ width: targetWatermarkWidth })
      .toBuffer({ resolveWithObject: true });

    const left = Math.max(0, width - watermarkInfo.width - WATERMARK_MARGIN_PX);
    const top = Math.max(0, height - watermarkInfo.height - WATERMARK_MARGIN_PX);

    let composed = image.composite([{ input: resizedWatermark, left, top }]);
    // sharp cần chỉ định output format tường minh để KHỚP ĐÚNG định dạng gốc.
    if (file.type === "image/png") composed = composed.png();
    else if (file.type === "image/webp") composed = composed.webp();
    else composed = composed.jpeg();

    const watermarkedBuffer = await composed.toBuffer();
    return { buffer: watermarkedBuffer, contentType: file.type };
  } catch (e) {
    console.error("[applyWatermark] Đóng watermark thất bại — dùng ảnh gốc không watermark:", e);
    return { buffer: originalBuffer, contentType: file.type };
  }
}
