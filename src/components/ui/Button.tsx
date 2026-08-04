import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BaseProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<BaseProps["variant"]>, string> = {
  primary: "bg-gold text-ink hover:bg-gold-dark",
  secondary: "bg-ink text-paper hover:bg-ink/90",
  ghost: "bg-transparent text-ink border border-line hover:border-ink/40",
};

const BASE = "inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-[14px] font-semibold transition-colors";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  variant = "primary",
  className = "",
  href,
}: BaseProps & { href: string }) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </Link>
  );
}
