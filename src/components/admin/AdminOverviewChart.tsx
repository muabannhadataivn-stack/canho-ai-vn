"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ChartPoint {
  /** dd/mm — nhãn hiển thị trục X */
  label: string;
  count: number;
}

// Màu lấy nguyên hex từ tailwind.config.ts (recharts không đọc được class Tailwind,
// cần literal color) — line/graphite/gold khớp đúng token đang dùng trong khu vực admin.
export function AdminOverviewChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#D8D3C7" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#242320" }} axisLine={{ stroke: "#D8D3C7" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#242320" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#D8D3C7", fontSize: 12.5 }}
            labelFormatter={(label) => `Ngày ${label}`}
            formatter={(value) => [`${value} lượt`, "Đăng ký"]}
          />
          <Line type="monotone" dataKey="count" stroke="#B8842B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
