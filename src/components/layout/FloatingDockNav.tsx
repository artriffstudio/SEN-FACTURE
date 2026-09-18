"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Receipt,
  Users,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  getLabel: (t: ReturnType<typeof useTranslation>["t"]) => string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const dockItems: DockItem[] = [
  {
    id: "dashboard",
    getLabel: (t) => t.nav.dashboard,
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    id: "invoices",
    getLabel: (t) => t.nav.invoices,
    href: "/invoices",
    icon: Receipt,
  },
  {
    id: "clients",
    getLabel: (t) => t.nav.clients,
    href: "/clients",
    icon: Users,
  },
  {
    id: "inventory",
    getLabel: (t) => t.nav.inventory,
    href: "/inventory",
    icon: Package,
  },
  {
    id: "reports",
    getLabel: (t) => t.nav.reports,
    href: "/reports",
    icon: BarChart3,
  },
  {
    id: "settings",
    getLabel: (t) => t.nav.settings,
    href: "/settings",
    icon: Settings,
  },
];

export default function FloatingDockNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Navigation flottante"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden max-w-[95vw] pointer-events-auto"
    >
      <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full shadow-[0_12px_32px_-4px_rgba(15,23,42,0.15)] ring-1 ring-slate-900/5 transition-all">
        {dockItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const label = item.getLabel(t);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full text-xs transition-all duration-200 select-none",
                isActive
                  ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold px-3.5 py-2 shadow-md shadow-sky-500/25 scale-102"
                  : "text-slate-500 hover:text-sky-600 hover:bg-sky-50 p-2 sm:px-2.5"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-transform",
                  isActive ? "stroke-[2.5]" : "stroke-[2]"
                )}
              />
              {isActive && (
                <span className="truncate max-w-[90px] text-[11px] tracking-tight">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
