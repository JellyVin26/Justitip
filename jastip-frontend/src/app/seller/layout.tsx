"use client";
import { usePathname } from 'next/navigation';
import React from 'react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname?.match(/\/seller\/orders\/[a-zA-Z0-9-]+/);

  return (
    <div className={`flex flex-col ${isFullPage ? 'h-[calc(100vh-64px)] overflow-hidden' : 'min-h-[calc(100vh-64px)]'}`}>
      {/* Main Content Area */}
      <div className={`flex-1 w-full flex flex-col ${isFullPage ? 'h-full' : ''}`}>
        {children}
      </div>
    </div>
  );
}
