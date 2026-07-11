"use client";
import { LayoutDashboard, Package, List, Wallet, Settings, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React, { useState } from 'react';
import AddListingModal from '@/components/AddListingModal';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;
  
  const linkClass = (path: string) => 
    isActive(path) 
      ? "flex items-center gap-3 px-4 py-3 bg-blue-100 text-brand-navy rounded-md font-bold text-sm"
      : "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm smooth-hover";

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col pt-8 fixed top-16 h-[calc(100vh-64px)] overflow-y-auto z-10">
        <div className="px-6 mb-8">
          <h2 className="text-sm font-bold text-brand-navy mb-1">Seller Studio</h2>
          <p className="text-xs text-gray-500 font-mono tracking-wider">Manage your deliveries</p>
        </div>
        
        <nav className="flex-1 space-y-1 px-4">
          <Link href="/seller/dashboard" className={linkClass('/seller/dashboard')}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/seller/orders" className={linkClass('/seller/orders')}>
            <Package className="w-5 h-5" /> Active Orders
          </Link>
          <Link href="/seller/listings" className={linkClass('/seller/listings')}>
            <List className="w-5 h-5" /> My Listings
          </Link>
          <Link href="/seller/wallet" className={linkClass('/seller/wallet')}>
            <Wallet className="w-5 h-5" /> Wallet
          </Link>
          <Link href="/seller/settings" className={linkClass('/seller/settings')}>
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
        
        <div className="p-4 mt-auto">
          <button 
            onClick={() => setIsAddListingModalOpen(true)}
            className="w-full bg-brand-navy text-white flex items-center justify-center gap-2 py-3 rounded-md font-medium text-sm hover:bg-gray-800 smooth-hover shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Listing
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 bg-[#F8F9FA] min-h-full">
        {children}
      </div>

      <AddListingModal 
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onSuccess={() => {
          setIsAddListingModalOpen(false);
          // Assuming window reload to refresh lists for MVP
          if (pathname.includes('/seller/listings')) {
             window.location.reload();
          }
        }}
      />
    </div>
  );
}
