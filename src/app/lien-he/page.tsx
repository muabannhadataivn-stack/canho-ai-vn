import type { Metadata } from "next";
import { BackHeader } from "@/components/layout/BackHeader";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { NoBackendForm } from "@/components/ui/NoBackendForm";

export const metadata: Metadata = { title: "Liên hệ" };

export default function LienHePage({ searchParams }: { searchParams: { "du-an"?: string } }) {
  const project = searchParams["du-an"];

  return (
    <div className="flex h-full flex-col bg-paper">
      <BackHeader title="Liên hệ" />
      <div className="flex-1 overflow-y-auto p-4">
        {project && (
          <p className="mb-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-[13px] text-ink/80">
            Nội dung liên hệ liên quan đến dự án: <strong>{project}</strong>
          </p>
        )}
        <NoBackendForm submitLabel="Gửi liên hệ">
          <FormField label="Họ và tên">
            <input className={inputClasses} placeholder="Nguyễn Văn A" />
          </FormField>
          <FormField label="Số điện thoại">
            <input className={inputClasses} placeholder="09xxxxxxxx" />
          </FormField>
          <FormField label="Nội dung">
            <textarea
              className={`${inputClasses} min-h-[110px]`}
              placeholder="Bạn cần hỗ trợ gì?"
              defaultValue={project ? `Tôi muốn hỏi thêm về dự án ${project}.` : ""}
            />
          </FormField>
        </NoBackendForm>
      </div>
    </div>
  );
}
