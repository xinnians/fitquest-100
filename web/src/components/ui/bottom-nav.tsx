"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusIcon, UsersIcon, CupIcon, UserIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

const NAV_ITEMS: {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { href: "/dashboard", label: "首頁", Icon: HomeIcon },
  { href: "/check-in", label: "打卡", Icon: PlusIcon },
  { href: "/social", label: "社交", Icon: UsersIcon },
  { href: "/diet", label: "飲食", Icon: CupIcon },
  { href: "/profile", label: "我的", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card-elevated rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto flex max-w-md items-center justify-around py-2">
        {/* Sliding indicator pill */}
        <div
          className="absolute top-0 h-[2.5px] w-8 rounded-full bg-gradient-to-r from-secondary to-primary transition-all shadow-glow-primary"
          style={{
            left: `${(activeIndex >= 0 ? activeIndex : 0) * 20 + 10}%`,
            transform: "translateX(-50%)",
            transitionDuration: "var(--duration-normal)",
            transitionTimingFunction: "var(--ease-spring)",
          }}
        />
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`btn-press flex flex-col items-center gap-0.5 px-4 py-2 transition-all ${
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              <item.Icon
                className={`h-6 w-6 transition-all ${
                  isActive
                    ? "scale-110 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]"
                    : ""
                }`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
