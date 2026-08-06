"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  previewCsvImport,
  importProjectsFromCsv,
  type CsvPreviewResult,
  type CsvImportResult,
} from "@/lib/csv-import-actions";

export default function ImportCsvPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<CsvPreviewResult | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
    setPreview(null);
    setResult(null);
    setError(null);
  }

  function buildFormData(): FormData {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return formData;
  }

  async function handlePreview() {
    if (files.length === 0) return;
    setError(null);
    setResult(null);
    setPreviewLoading(true);
    const res = await previewCsvImport(buildFormData());
    setPreviewLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Có lỗi khi xem trước.");
      return;
    }
    setPreview(res);
  }

  async function handleImport() {
    if (files.length === 0) return;
    setError(null);
    setImportLoading(true);
    const res = await importProjectsFromCsv(buildFormData());
    setImportLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Có lỗi khi import.");
      return;
    }
    setPreview(null);
    setResult(res);
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-[19px] font-bold text-ink">Nhập CSV — Chợ Cư Dân</h1>
        <Link href="/admin/du-an" className="text-[13px] font-medium text-blueprint">
          ← Danh sách dự án
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4">
        <label className="mb-3 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">
            Chọn file CSV (có thể chọn nhiều file cùng lúc)
          </span>
          <input type="file" accept=".csv" multiple onChange={handleFileChange} className="block text-[13.5px]" />
        </label>

        {files.length > 0 && (
          <p className="mb-3 text-[12.5px] text-graphite/60">
            Đã chọn {files.length} file: {files.map((f) => f.name).join(", ")}
          </p>
        )}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handlePreview}
            disabled={files.length === 0 || previewLoading || importLoading}
            className="rounded-xl border border-line px-4 py-2.5 text-[13.5px] font-semibold text-ink disabled:opacity-60"
          >
            {previewLoading ? "Đang xem trước..." : "Xem trước"}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={files.length === 0 || previewLoading || importLoading}
            className="rounded-xl bg-gold px-4 py-2.5 text-[13.5px] font-semibold text-ink disabled:opacity-60"
          >
            {importLoading ? "Đang import..." : "Import"}
          </button>
        </div>

        {error && <p className="mt-3 text-[13px] text-red">{error}</p>}

        {preview && (
          <div className="mt-4 rounded-xl border border-line bg-paper p-3 text-[13.5px]">
            <div className="mb-1.5 font-semibold text-ink">Xem trước — CHƯA ghi gì vào DB:</div>
            <ul className="list-inside list-disc space-y-0.5 text-graphite">
              <li>Tổng số dòng đọc được: {preview.total}</li>
              <li>Nhận diện được tỉnh: {preview.resolvedProvince}</li>
              <li>Rơi vào &ldquo;Chưa xác định&rdquo;: {preview.unresolvedProvince}</li>
              <li>Trùng với dự án đã có trong DB (sẽ bị bỏ qua khi Import): {preview.duplicateInDb}</li>
            </ul>
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-xl border border-green/30 bg-green/5 p-3 text-[13.5px]">
            <div className="mb-1.5 font-semibold text-green">Import xong.</div>
            <ul className="list-inside list-disc space-y-0.5 text-graphite">
              <li>Tổng số dòng đọc được: {result.total}</li>
              <li>Đã import (draft): {result.imported}</li>
              <li>Bỏ qua vì trùng: {result.skippedDuplicate}</li>
              <li>Rơi vào &ldquo;Chưa xác định&rdquo; (vẫn import, cần sửa tay tỉnh sau): {result.unresolvedProvince}</li>
            </ul>
            <Link href="/admin/du-an" className="mt-2 inline-block text-[13px] font-semibold text-blueprint">
              Xem danh sách dự án →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
