"use client";
import { LayoutDashboard, Package, List, Settings, Plus } from 'lucide-react';
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
      ? "flex items-center gap-2 px-3 py-2 bg-blue-50 text-brand-navy rounded-md font-bold text-sm border-b-2 border-brand-navy"
      : "flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm transition-colors border-b-2 border-transparent hover:border-gray-300";

  const isFullPage = pathname.match(/\/seller\/orders\/[a-zA-Z0-9-]+/);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#F8F9FA]">
      
      {/* Top Navbar for Seller Studio */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-16 z-20 shadow-sm h-[65px]">
        <div className="flex items-center gap-8">
          <div>
            <h2 className="text-sm font-bold text-brand-navy leading-tight">Seller Studio</h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider">Manage deliveries</p>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/seller/dashboard" className={linkClass('/seller/dashboard')}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/seller/orders" className={linkClass('/seller/orders')}>
              <Package className="w-4 h-4" /> Active Orders
            </Link>
            <Link href="/seller/listings" className={linkClass('/seller/listings')}>
              <List className="w-4 h-4" /> My Listings
            </Link>
            <Link href="/seller/settings" className={linkClass('/seller/settings')}>
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </nav>
        </div>
        <button 
          onClick={() => setIsAddListingModalOpen(true)}
          className="bg-[#0A192F] text-white flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Listing
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full bg-[#F8F9FA] flex flex-col ${isFullPage ? '' : 'max-w-7xl mx-auto p-8'}`}>
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
