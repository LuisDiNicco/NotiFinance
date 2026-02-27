"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
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

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const routes = [
    ...publicRoutes,
    ...(isAuthenticated ? protectedRoutes : []),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight">NotiFinance</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {routes.map((route) => {
              const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
