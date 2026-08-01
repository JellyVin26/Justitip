"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Plane, List, X, User, LogOut, Package, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isSeller = user?.role === "SELLER";

  const navLinks = isSeller
    ? [
        { href: "/explore", label: "Explore" },
        { href: "/marketplace", label: "Marketplace" },
        { href: "/seller/dashboard", label: "Dashboard" },
        { href: "/seller/orders", label: "Orders" },
        { href: "/seller/listings", label: "Listings" },
      ]
    : [
        { href: "/explore", label: "Explore" },
        { href: "/marketplace", label: "Marketplace" },
        { href: "/orders", label: "My Orders" },
      ];

  return (
    <nav className="glass-nav sticky top-0 z-50 h-16">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950">
            <Plane size={20} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-zinc-100">
            Jastip<span className="text-emerald-500">.</span>
          </span>
        </Link>

        {/* Desktop links */}
        {isAuthenticated && (
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-bold text-zinc-300 transition-colors hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          ) : (
            <>
              {isSeller && (
                <Link href="/seller/dashboard" className="btn-dark !px-5 !py-2 text-xs">
                  Seller Hub
                </Link>
              )}
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-100 transition-colors hover:bg-zinc-700"
                title="Settings"
              >
                {user?.name?.charAt(0) || <User size={16} />}
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div ref={menuRef} className="border-t border-white/5 bg-zinc-950 md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                >
                  <User size={18} /> Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-400 hover:bg-zinc-900"
                >
                  <Package size={18} /> Get started
                </Link>
              </>
            ) : (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      pathname === link.href
                        ? "bg-zinc-900 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    {link.label === "Dashboard" || link.label === "Seller Hub" ? (
                      <LayoutDashboard size={18} />
                    ) : (
                      <Package size={18} />
                    )}
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-white/5 pt-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-900"
                  >
                    <User size={18} /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-zinc-900"
                  >
                    <LogOut size={18} /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
