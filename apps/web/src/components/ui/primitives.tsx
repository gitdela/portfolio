import Link from "next/link";
import type { Route } from "next";

/** The 680px column shared by nav, main, and footer. */
export function Column({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-column px-gutter ${className}`}>{children}</div>;
}

/**
 * `main` padding-top differs across three page groups in the handoff, so it is a variant
 * rather than a constant: Home is the tallest, the four standard pages sit in the middle,
 * and the case study is the shortest.
 */
const MAIN_PADDING = {
  home: "pt-[clamp(48px,10vw,88px)]",
  standard: "pt-[clamp(44px,9vw,72px)]",
  article: "pt-[clamp(40px,8vw,64px)]",
} as const;

export function PageMain({
  children,
  variant = "standard",
}: {
  children: React.ReactNode;
  variant?: keyof typeof MAIN_PADDING;
}) {
  return (
    <main id="main" className={`mx-auto max-w-column px-gutter pb-16 ${MAIN_PADDING[variant]}`}>
      {children}
    </main>
  );
}

const PILL_BASE = "inline-block rounded-full font-bold no-underline";

/** Primary pill: accent fill, background-coloured text. */
export function PrimaryPill({
  href,
  children,
  className = "",
}: {
  href: Route;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${PILL_BASE} bg-accent px-5 py-2.5 text-bg hover:no-underline ${className}`}
    >
      {children}
    </Link>
  );
}

/** Secondary pill: 1.5px outline, ink text. */
export function SecondaryPill({
  href,
  children,
  className = "",
}: {
  href: Route;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${PILL_BASE} border-[1.5px] border-line px-5 py-2.5 text-ink hover:border-accent hover:no-underline ${className}`}
    >
      {children}
    </Link>
  );
}

/** A skill chip. */
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-chip px-[14px] py-[5px] text-tag font-semibold">
      {children}
    </span>
  );
}

/** Card surface: 1px line border, card fill, 12px radius, accent border on hover. */
export const CARD_CLASS =
  "block overflow-hidden rounded-xl border border-line bg-card text-ink no-underline transition-colors hover:border-accent hover:no-underline";
