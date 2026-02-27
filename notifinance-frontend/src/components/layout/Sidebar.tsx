"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  TrendingUp,
  Globe,
  Landmark,
  Star,
  Briefcase,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const publicRoutes = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Acciones", href: "/assets/acciones", icon: TrendingUp },
  { name: "CEDEARs", href: "/assets/cedears", icon: Globe },
  { name: "Bonos", href: "/assets/bonos", icon: Landmark },
];

const protectedRoutes = [
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Alertas", href: "/alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const routes = [
    ...publicRoutes,
    ...(isAuthenticated ? protectedRoutes : []),
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">N</span>
          </div>
          <span className="font-bold text-xl tracking-tight">NotiFinance</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
