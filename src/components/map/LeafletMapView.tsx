"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ProjectWithTier, SalesStatus } from "@/lib/types";

/**
 * Bản đồ Leaflet thật (tile OpenStreetMap, miễn phí, không cần API key — nhất quán với
 * osm-places.ts đã dùng cho "Tìm tiện ích lân cận", tránh vấn đề billing từng gặp với Google).
 * File này CHỈ được import qua next/dynamic({ ssr: false }) từ MapCanvas.tsx — Leaflet đọc
 * `window`/`document` ngay lúc import module, chạy ở server sẽ lỗi "window is not defined".
 */

// Cùng bảng màu trạng thái với StatusBadge — giữ nhất quán khi chuyển từ ghim canvas cũ
// (MapPin.tsx, đã gỡ) sang marker bản đồ thật.
const STATUS_COLOR: Record<SalesStatus, string> = {
  "dang-mo-ban": "#3E7A4C",
  "sap-mo-ban": "#2C5F8A",
  "da-ban-giao": "#6b7684",
  "dang-cap-nhat": "#9a9488",
};

function getInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter((w) => w[0] === w[0]?.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || name.slice(0, 2).toUpperCase();
}

// Marker dạng chấm tròn màu + chữ đầu tên dự án (DivIcon, không dùng ảnh icon mặc định của
// Leaflet — tránh lỗi icon vỡ kinh điển khi bundle qua webpack/Next.js).
function buildIcon(project: ProjectWithTier, active: boolean): L.DivIcon {
  const color = STATUS_COLOR[project.salesStatus];
  const ringStyle = active ? "box-shadow:0 0 0 3px #B8842B, 0 1px 3px rgba(0,0,0,0.35);" : "box-shadow:0 1px 3px rgba(0,0,0,0.35);";
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;border:2px solid white;background:${color};color:white;font-size:10px;font-weight:700;font-family:sans-serif;${ringStyle}">${getInitials(project.name)}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

// Tự fit-bounds theo toạ độ các dự án đang có — không hardcode 1 mức zoom cố định (yêu cầu #6).
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0]!, 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
  }, [map, points]);
  return null;
}

const VIETNAM_CENTER: [number, number] = [16.0, 106.0];

export default function LeafletMapView({
  projects,
  activeId,
  onSelectProject,
}: {
  projects: ProjectWithTier[];
  activeId: string | null;
  onSelectProject: (id: string) => void;
}) {
  const points = useMemo(
    () => projects.map((p) => [p.location.lat!, p.location.lng!] as [number, number]),
    [projects]
  );

  return (
    <MapContainer center={VIETNAM_CENTER} zoom={6} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {projects.map((project) => (
        <Marker
          key={project.id}
          position={[project.location.lat!, project.location.lng!]}
          icon={buildIcon(project, project.id === activeId)}
          eventHandlers={{ click: () => onSelectProject(project.id) }}
        />
      ))}
    </MapContainer>
  );
}
