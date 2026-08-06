import type { CommunityLink } from "@/lib/types";

export function ChoCuDanPromo({ community }: { community?: CommunityLink }) {
  if (!community || !community.url) return null;

  return (
    <div className="mx-4 mt-5 rounded-2xl border border-community/30 bg-community/5 p-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-community text-[13px] font-bold text-white">
          CCD
        </span>
        <div>
          <div className="flex items-center gap-1.5 font-display text-[13.5px] font-bold text-ink">
            {community.communityName}
            <span className="rounded-full bg-community-badge-bg px-2 py-0.5 text-[10px] font-semibold text-community">
              Liên kết
            </span>
          </div>
          <p className="text-[11.5px] text-community-tagline">Kết nối cư dân cùng dự án — mua bán, chia sẻ an toàn, miễn phí</p>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {["Đồ cũ", "Đồ ăn nhà làm", "BĐS chính chủ"].map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full border border-community-tag-border bg-white px-2.5 py-1 text-[11px] font-medium text-community-tag-text"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-community-tag-icon-bg">
              <span className="h-1.5 w-1.5 rounded-full bg-community" />
            </span>
            {tag}
          </span>
        ))}
      </div>
      <a
        href={community.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex items-center justify-center rounded-xl bg-community px-4 py-2.5 text-[13px] font-semibold text-white"
      >
        Mở Chợ Cư Dân →
      </a>
    </div>
  );
}
