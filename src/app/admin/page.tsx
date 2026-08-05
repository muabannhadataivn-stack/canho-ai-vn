import { redirect } from "next/navigation";

// Trang chính /admin là danh sách dự án — xem src/app/admin/du-an/page.tsx.
export default function AdminIndexPage() {
  redirect("/admin/du-an");
}
