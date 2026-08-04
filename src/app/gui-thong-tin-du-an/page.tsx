import type { Metadata } from "next";
import { BackHeader } from "@/components/layout/BackHeader";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { NoBackendForm } from "@/components/ui/NoBackendForm";

export const metadata: Metadata = { title: "Gửi thông tin dự án" };

export default function GuiThongTinDuAnPage() {
  return (
    <div className="flex h-full flex-col bg-paper">
      <BackHeader title="Gửi thông tin dự án" />
      <div className="flex-1 overflow-y-auto p-4">
        <NoBackendForm submitLabel="Gửi thông tin">
          <FormField label="Tên dự án">
            <input className={inputClasses} placeholder="VD: Vinhomes Grand Park" />
          </FormField>
          <FormField label="Tỉnh / Thành phố">
            <select className={inputClasses}>
              <option>TP.HCM</option>
              <option>Hà Nội</option>
              <option>Đồng Nai</option>
              <option>Hưng Yên</option>
            </select>
          </FormField>
          <FormField label="Vai trò của bạn">
            <select className={inputClasses}>
              <option>Chủ đầu tư</option>
              <option>Môi giới</option>
              <option>Cư dân</option>
              <option>Khác</option>
            </select>
          </FormField>
          <FormField label="Số điện thoại">
            <input className={inputClasses} placeholder="09xxxxxxxx" />
          </FormField>
          <FormField label="Thông tin cập nhật">
            <textarea className={`${inputClasses} min-h-[110px]`} placeholder="Mô tả thông tin cần cập nhật..." />
          </FormField>
        </NoBackendForm>
      </div>
    </div>
  );
}
