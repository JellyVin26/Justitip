"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, UserCircle, LogOut, Settings, LayoutDashboard, Package, List, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { useState } from 'react';
import PostTripModal from './PostTripModal';
import AddListingModal from '@/components/AddListingModal';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isPostTripModalOpen, setIsPostTripModalOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  
  const isActive = (path: string) => pathname ? (pathname === path || pathname.startsWith(path + '/')) : false;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 glass-nav z-50 flex items-center justify-between px-8">
        {/* Left side */}
        {/* Left side */}
        <div className="flex items-center gap-8">
          <Link href={pathname?.includes('/seller') ? "/seller/dashboard" : "/"} className="text-2xl font-black tracking-tight text-brand-navy">
            Justitip
          </Link>
          {!pathname?.includes('/seller') ? (
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
              <Link href="/marketplace" className={isActive('/marketplace') ? "text-brand-navy border-b-2 border-brand-accent pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Marketplace</Link>
              <Link href="/explore" className={isActive('/explore') ? "text-brand-navy border-b-2 border-brand-accent pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Explore</Link>
              <Link href="/trips" className={isActive('/trips') ? "text-brand-navy border-b-2 border-brand-accent pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Trips</Link>
              <Link href="/orders" className={isActive('/orders') ? "text-brand-navy border-b-2 border-brand-accent pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Orders</Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-5 text-sm font-semibold text-gray-500 pl-6 border-l border-gray-200/50">
              <div className="flex flex-col mr-4">
                <span className="text-sm font-bold text-brand-navy leading-none">Seller Studio</span>
                <span className="text-[10px] text-gray-400 font-mono tracking-wider">Manage deliveries</span>
              </div>
              <Link href="/seller/dashboard" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg smooth-hover ${isActive('/seller/dashboard') ? "bg-gray-100 text-brand-navy" : "hover:bg-gray-50 hover:text-brand-navy"}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/seller/orders" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg smooth-hover ${isActive('/seller/orders') ? "bg-gray-100 text-brand-navy" : "hover:bg-gray-50 hover:text-brand-navy"}`}>
                <Package className="w-4 h-4" /> Active Orders
              </Link>
              <Link href="/seller/listings" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg smooth-hover ${isActive('/seller/listings') ? "bg-gray-100 text-brand-navy" : "hover:bg-gray-50 hover:text-brand-navy"}`}>
                <List className="w-4 h-4" /> My Listings
              </Link>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link href="/seller" className="text-sm font-semibold text-gray-500 hover:text-brand-navy smooth-hover">
                Become a Seller
              </Link>
              <Link href="/login" className="bg-brand-navy text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 active-press hover-lift shadow-premium tracking-wide">
                Sign In
              </Link>
            </>
          ) : (
            <>

              {pathname?.includes('/seller') && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsAddListingModalOpen(true)}
                    className="bg-gray-50 text-brand-navy border border-gray-200 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-100 active-press hover-lift shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Listing
                  </button>
                  <button 
                    onClick={() => setIsPostTripModalOpen(true)}
                    className="bg-brand-accent text-white px-5 py-2 rounded-lg font-bold text-xs active-press hover-lift shadow-premium tracking-wider"
                  >
                    POST TRIP
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4 text-gray-500 border-l border-gray-200 pl-6 ml-2">
                <Bell className="w-5 h-5 cursor-pointer hover:text-brand-navy smooth-hover" />
                <MessageSquare className="w-5 h-5 cursor-pointer hover:text-brand-navy smooth-hover" />
                
                <div className="group relative">
                  <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-50 smooth-hover">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover shadow-sm border border-white"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-navy to-gray-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  {/* Dropdown - Glassmorphic */}
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right transform scale-95 group-hover:scale-100">
                    <div className="p-4 border-b border-gray-200/50">
                      <p className="text-sm font-bold text-brand-navy truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link href="/settings" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-brand-navy hover:bg-gray-50/80 rounded-xl flex items-center gap-3 font-semibold smooth-hover">
                        <Settings className="w-4 h-4 text-gray-400" /> Settings
                      </Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 rounded-xl flex items-center gap-3 font-semibold smooth-hover mt-1">
                        <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      <PostTripModal 
        isOpen={isPostTripModalOpen}
        onClose={() => setIsPostTripModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
      <AddListingModal 
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onSuccess={() => {
          if (pathname?.includes('/seller/listings')) {
             window.location.reload();
          }
        }}
      />
    </>
  );
}
