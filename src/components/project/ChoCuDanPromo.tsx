import type { CommunityLink } from "@/lib/types";

export function ChoCuDanPromo({ community }: { community?: CommunityLink }) {
  if (!community || !community.url) return null;

  return (
    <div className="mx-4 mt-5 rounded-2xl border border-community/30 bg-community/5 p-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-community/15 text-[13px] font-bold text-community">
          CCD
        </span>
        <div>
          <div className="flex items-center gap-1.5 font-display text-[13.5px] font-bold text-ink">
            {community.communityName}
            <span className="rounded-full bg-community/15 px-2 py-0.5 text-[10px] font-semibold text-community">
              Liên kết
            </span>
          </div>
          <p className="text-[11.5px] text-graphite/55">Kết nối cư dân cùng dự án — mua bán, chia sẻ an toàn, miễn phí</p>
        </div>
      </div>
      <a
        href={community.url}
        target="_blank"
        rel="nofollow noopener"
        className="flex items-center justify-center rounded-xl bg-community px-4 py-2.5 text-[13px] font-semibold text-white"
      >
        Mở Chợ Cư Dân →
      </a>
    </div>
  );
}
