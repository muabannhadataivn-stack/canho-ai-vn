/**
 * Sinh slug kebab-case từ tên. Dùng cho seed/CTV nhập liệu — theo DATA-SCHEMA mục 1,
 * slug sinh tự động PHẢI được review tay trước publish để tránh trùng.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Trùng slug giữa 2 tỉnh khác nhau → thêm mã tỉnh để phân biệt (theo CONTENT-PIPELINE.md,
 * mục "Xử lý xung đột & trùng lặp nguồn").
 */
export function disambiguateSlug(baseSlug: string, provinceSlug: string): string {
  return `${baseSlug}-${provinceSlug}`;
}
