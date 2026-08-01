"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

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
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-zinc-950 ${isFullPage ? "h-[calc(100vh-64px)] overflow-hidden" : "min-h-[calc(100vh-64px)]"}`}>
      {/* Main Content Area */}
      <div className={`flex w-full flex-1 flex-col ${isFullPage ? "h-full" : ""}`}>
        {children}
      </div>
    </div>
  );
}
