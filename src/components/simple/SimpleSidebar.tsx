"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Receipt,
  Users,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SimpleSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/simple", icon: LayoutGrid },
    { label: "Factures", href: "/invoices", icon: Receipt },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Paramètres", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-16 sm:w-56 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 p-3 select-none">
      <div className="space-y-6">
        {/* Navigation principale */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-sky-50 text-sky-700 font-bold shadow-2xs border border-sky-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon size={17} className={cn("shrink-0", isActive ? "text-sky-600 stroke-[2.5]" : "text-slate-400")} />
                <span className="hidden sm:inline truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pied de sidebar : Bascule vers vue avancée */}
      <div className="pt-3 border-t border-slate-100">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition-colors group"
          title="Basculer vers la vue complète"
        >
          <span className="hidden sm:inline">Vue Complète</span>
          <ArrowUpRight size={13} className="text-slate-400 group-hover:text-slate-600" />
        </Link>
      </div>
    </aside>
  );
}
