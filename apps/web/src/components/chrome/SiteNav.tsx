"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Nested routes keep their section active: /work/mybitstore highlights "Work", and
 * /blog/some-post highlights "Blog". Home only matches exactly, or it would match
 * everything.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface SiteNavProps {
  wordmarkStrong: string;
  wordmarkLight: string;
  fullName: string;
}

export function SiteNav({ wordmarkStrong, wordmarkLight, fullName }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="mx-auto flex max-w-column flex-wrap items-center justify-between gap-x-4 gap-y-3 px-gutter pt-5"
    >
      <Link href="/" className="inline-block text-ink hover:no-underline" aria-label={fullName}>
        <span className="block text-body leading-[1.2] tracking-[0.13em]">
          <span className="font-bold">{wordmarkStrong}</span>
          <span className="font-light">{wordmarkLight}</span>
        </span>
        <span className="mt-[3px] block h-[2.5px] w-5 bg-accent" />
      </Link>

      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[10px] text-nav">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active ? "font-bold text-ink hover:no-underline" : "text-accent hover:underline"
              }
            >
              {item.label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
}
