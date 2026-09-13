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
  Headphones,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// 7 piliers essentiels du SaaS Facturation avec routes et identifiants uniques
const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    description: "Vue d'ensemble de l'activité, indicateurs clés et registre des factures",
    href: "/",
    icon: LayoutGrid,
  },
  {
    id: "invoices",
    label: "Factures & Devis",
    description: "Créer, consulter, imprimer et télécharger toutes vos factures",
    href: "/invoices",
    icon: Receipt,
  },
  {
    id: "clients",
    label: "Clients & Entreprises",
    description: "Gérer votre répertoire de clients, coordonnées et encours",
    href: "/clients",
    icon: Users,
  },
  {
    id: "inventory",
    label: "Articles & Prestations",
    description: "Catalogue de vos prestations de services et tarifs officiels",
    href: "/inventory",
    icon: Package,
  },
  {
    id: "reports",
    label: "Rapports & Chiffre d'affaires",
    description: "Statistiques des ventes, suivi des créances et conformité comptable",
    href: "/reports",
    icon: BarChart3,
  },
];

const otherNavItems: NavItem[] = [
  {
    id: "settings",
    label: "Paramètres de l'entreprise",
    description: "Identifiants fiscaux NINEA, taux de TVA 18%, logo et devises",
    href: "/settings",
    icon: Settings,
  },
  {
    id: "support",
    label: "Assistance & Support",
    description: "Contacter le support client dédié et consulter l'aide",
    href: "/support",
    icon: Headphones,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Vous avez été déconnecté.");
      router.push("/login");
    } catch (err) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const displayName =
    user?.user_metadata?.company_name ||
    user?.user_metadata?.full_name ||
    "SEN FACTURE";
  const displayEmail = user?.email || "contact@senfacture.sn";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SF";

  // Détection stricte et univoque de l'élément actif : UNE SEULE ICÔNE ACTIVE À LA FOIS
  const isItemActive = (item: NavItem) => {
    if (item.id === "dashboard") {
      return pathname === "/";
    }
    if (item.id === "invoices") {
      return pathname === "/invoices" || (pathname.startsWith("/invoices/") && pathname !== "/invoices/new");
    }
    if (item.id === "clients") {
      return pathname.startsWith("/clients");
    }
    if (item.id === "inventory") {
      return pathname.startsWith("/inventory");
    }
    if (item.id === "reports") {
      return pathname.startsWith("/reports");
    }
    if (item.id === "settings") {
      return pathname === "/settings";
    }
    if (item.id === "support") {
      return pathname.startsWith("/support");
    }
    return false;
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar: Responsive Drawer on Mobile (w-72), Sleek Icon Rail on Desktop (w-[76px]) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0",
          "w-72 sm:w-80 lg:w-[76px]",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none",
          "lg:overflow-visible"
        )}
      >
        {/* Top Header & Logo Area (Fixed proportions, never compressed) */}
        <div className="w-full shrink-0 border-b border-slate-100 lg:border-none">
          <div className="flex items-center justify-between px-5 py-4 lg:px-0 lg:py-4 lg:justify-center">
            {/* Logo Link with Rich Tooltip */}
            <div className="relative group flex justify-center">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 shrink-0"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-sky-700 shadow-md shadow-slate-900/10 group-hover:shadow-sky-500/20 flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shrink-0 transition-transform group-hover:scale-105">
                  SF
                </div>
                <div className="flex flex-col lg:hidden">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                    SEN FACTURE
                  </span>
                  <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider mt-1">
                    SaaS Facturation
                  </span>
                </div>
              </Link>

              {/* Tooltip Logo Desktop */}
              <div className="hidden lg:group-hover:flex items-center absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in duration-100">
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-white drop-shadow-xs" />
                <div className="bg-white text-slate-900 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xl border border-slate-200/90 whitespace-nowrap flex items-center gap-2 ring-1 ring-slate-900/5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>SEN FACTURE</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Items (lg:overflow-visible so tooltips pop out without being clipped) */}
        <div className="flex-1 w-full overflow-y-auto lg:overflow-visible no-scrollbar py-3 px-3 lg:px-2 space-y-6">
          {/* SECTION MENU */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 px-3 lg:px-0 lg:text-center tracking-widest uppercase mb-2">
              MENU
            </div>
            <nav className="flex flex-col space-y-1.5">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <div key={item.id} className="relative group w-full">
                    {/* Desktop Active Cyan Left Indicator Bar */}
                    {active && (
                      <span className="hidden lg:block absolute left-0 top-1 bottom-1 w-1 bg-sky-500 rounded-r-md" />
                    )}

                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center rounded-xl transition-all duration-200 cursor-pointer",
                        // Mobile layout: icon + full text label + subtitle
                        "w-full px-3 py-2.5 gap-3 lg:w-11 lg:h-11 lg:p-0 lg:justify-center lg:mx-auto",
                        active
                          ? "bg-sky-100/90 text-sky-600 font-bold shadow-xs scale-102"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 hover:shadow-2xs hover:-translate-y-0.5"
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          "shrink-0 transition-transform group-hover:scale-110",
                          active ? "text-sky-600 stroke-[2.3]" : "stroke-[1.8]"
                        )}
                      />
                      {/* Label visible on mobile */}
                      <div className="lg:hidden flex items-center min-w-0 flex-1">
                        <span className="text-xs font-bold truncate text-slate-800">
                          {item.label}
                        </span>
                      </div>
                      {active && (
                        <ChevronRight size={14} className="lg:hidden text-sky-500 ml-auto shrink-0" />
                      )}
                    </Link>

                    {/* Desktop Tooltip Blanc épuré avec icône bleue et nom uniquement */}
                    <div className="hidden lg:group-hover:flex items-center absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                      {/* Flèche blanche */}
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-white drop-shadow-xs" />
                      <div className="bg-white text-slate-900 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xl border border-slate-200/90 whitespace-nowrap flex items-center gap-2 ring-1 ring-slate-900/5">
                        <Icon size={16} className="text-sky-600 shrink-0 stroke-[2.3]" />
                        <span>{item.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* SECTION AUTRES */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 px-3 lg:px-0 lg:text-center tracking-widest uppercase mb-2">
              AUTRES
            </div>
            <nav className="flex flex-col space-y-1.5">
              {otherNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <div key={item.id} className="relative group w-full">
                    {active && (
                      <span className="hidden lg:block absolute left-0 top-1 bottom-1 w-1 bg-sky-500 rounded-r-md" />
                    )}

                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center rounded-xl transition-all duration-200 cursor-pointer",
                        "w-full px-3 py-2.5 gap-3 lg:w-11 lg:h-11 lg:p-0 lg:justify-center lg:mx-auto",
                        active
                          ? "bg-sky-100/90 text-sky-600 font-bold shadow-xs scale-102"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 hover:shadow-2xs hover:-translate-y-0.5"
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          "shrink-0 transition-transform group-hover:scale-110",
                          active ? "text-sky-600 stroke-[2.3]" : "stroke-[1.8]"
                        )}
                      />
                      <div className="lg:hidden flex items-center min-w-0 flex-1">
                        <span className="text-xs font-bold truncate text-slate-800">
                          {item.label}
                        </span>
                      </div>
                      {active && (
                        <ChevronRight size={14} className="lg:hidden text-sky-500 ml-auto shrink-0" />
                      )}
                    </Link>

                    {/* Desktop Tooltip Blanc épuré avec icône bleue et nom uniquement */}
                    <div className="hidden lg:group-hover:flex items-center absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-white drop-shadow-xs" />
                      <div className="bg-white text-slate-900 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xl border border-slate-200/90 whitespace-nowrap flex items-center gap-2 ring-1 ring-slate-900/5">
                        <Icon size={16} className="text-sky-600 shrink-0 stroke-[2.3]" />
                        <span>{item.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User Profile Area */}
        <div className="w-full shrink-0 p-3 border-t border-slate-100 space-y-2">
          <div className="relative group w-full flex justify-center">
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors w-full lg:justify-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-300/80 bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="flex flex-col lg:hidden min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  {displayEmail}
                </span>
              </div>
            </Link>

            {/* Tooltip Profil Desktop Blanc avec icône bleue */}
            <div className="hidden lg:group-hover:flex items-center absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-white drop-shadow-xs" />
              <div className="bg-white text-slate-900 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xl border border-slate-200/90 whitespace-nowrap flex items-center gap-2 ring-1 ring-slate-900/5">
                <Settings size={16} className="text-sky-600 shrink-0 stroke-[2.3]" />
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{displayName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{displayEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <div className="pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 transition-all text-xs font-semibold lg:justify-center cursor-pointer group"
              title="Se déconnecter"
            >
              <LogOut size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
              <span className="lg:hidden">Se déconnecter</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
