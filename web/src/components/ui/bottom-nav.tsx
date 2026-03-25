"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UsersIcon, SparklesIcon, UserIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

const NAV_ITEMS: {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { href: "/dashboard", label: "首頁", Icon: HomeIcon },
  { href: "/social", label: "社交", Icon: UsersIcon },
  { href: "/characters", label: "角色", Icon: SparklesIcon },
  { href: "/profile", label: "我的", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard")
      return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-2 pb-5 pt-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex w-[60px] flex-col items-center justify-center gap-1 transition-colors duration-200"
            >
              <item.Icon
                className={`h-6 w-6 ${
                  active ? "text-[#F97316]" : "text-[#CBD5E1]"
                }`}
              />
              <span
                className={`text-[10px] ${
                  active
                    ? "font-semibold text-[#F97316]"
                    : "font-medium text-[#CBD5E1]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
