import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-[16px] font-bold text-paper">
      <svg width="23" height="23" viewBox="0 0 120 120" className="shrink-0" aria-hidden>
        <rect width="120" height="120" rx="26" fill="#2C5F8A" />
        {[12, 38, 64, 90].map((y) =>
          [25, 51, 77].map((x) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="18"
              height="18"
              rx="5"
              fill={x === 51 && y === 38 ? "#00A87E" : "#F7F5EF"}
              opacity={x === 51 && y === 38 ? 1 : 0.85}
            />
          ))
        )}
      </svg>
      canho<span className="text-[#00A87E] font-sans">.ai</span>
      <span className="text-blueprint-light font-sans font-medium">.vn</span>
    </Link>
  );
}
