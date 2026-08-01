"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ListChecks,
  Plane,
  Settings,
  LogOut,
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/orders", label: "Orders", icon: Package },
  { href: "/seller/listings", label: "Listings", icon: ListChecks },
  { href: "/seller/trips", label: "My trips", icon: Plane },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  const isFullPage = pathname?.match(/\/seller\/orders\/[a-zA-Z0-9-]+/);

  // Role guard: only SELLER role can access /seller/*
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "SELLER") {
        router.replace("/explore");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== "SELLER") {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-navy-950">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gold-400"></div>
      </div>
    );
  }

  // Full-page chat layout (order detail) renders without sidebar
  if (isFullPage) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-navy-950">
        <div className="flex w-full flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950 text-zinc-100">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-60 shrink-0 flex-col border-r border-white/5 py-8 lg:flex">
          <p className="mb-4 px-6 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Seller hub
          </p>
          <nav className="flex-1 space-y-1 px-3">
            {SIDEBAR_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/seller/dashboard" && pathname?.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-gold-400/10 text-gold-300"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/5 px-3 pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-sm font-bold text-gold-300">
                {user?.name?.charAt(0) || "S"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-zinc-100">{user?.name}</p>
                <p className="text-[11px] font-medium text-zinc-500">{user?.email}</p>
              </div>
              <button
                onClick={() => { logout(); }}
                className="shrink-0 text-zinc-500 transition-colors hover:text-red-400"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {/* Mobile seller nav (horizontal scroll pills under navbar) */}
      <nav className="flex gap-2 overflow-x-auto border-b border-white/5 px-4 py-3 lg:hidden">
        {SIDEBAR_LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/seller/dashboard" && pathname?.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                active
                  ? "bg-gold-400 text-navy-950"
                  : "bg-navy-900 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
