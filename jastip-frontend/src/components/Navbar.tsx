"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  
  const isActive = (path: string) => pathname ? (pathname === path || pathname.startsWith(path + '/')) : false;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-8">
      {/* Left side */}
      <div className="flex items-center gap-10">
        <Link href="/" className="text-2xl font-bold tracking-tight text-brand-navy">
          Justitip
        </Link>
        {!pathname?.includes('/seller') && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/marketplace" className={isActive('/marketplace') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Marketplace</Link>
            <Link href="/explore" className={isActive('/explore') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Explore</Link>
            <Link href="/trips" className={isActive('/trips') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Trips</Link>
            <Link href="/orders" className={isActive('/orders') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Orders</Link>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {!isAuthenticated ? (
          <>
            <Link href="/seller" className="text-sm font-medium text-gray-600 hover:text-brand-navy smooth-hover">
              Become a Seller
            </Link>
            <Link href="/login" className="bg-brand-navy text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 smooth-hover tracking-wide shadow-sm">
              Sign In
            </Link>
          </>
        ) : (
          <>
            {user?.role === 'SELLER' && (
              <Link href="/seller/dashboard" className="text-sm font-bold text-brand-accent hover:text-orange-600 smooth-hover bg-orange-50 px-3 py-1.5 rounded-md">
                Seller Dashboard
              </Link>
            )}
            {pathname?.includes('/seller') && (
              <button className="bg-brand-navy text-white px-5 py-2 rounded font-medium text-sm hover:bg-gray-800 smooth-hover tracking-wider shadow-sm">
                POST TRIP
              </button>
            )}
            <div className="flex items-center gap-4 text-gray-500 border-l border-gray-200 pl-6 ml-2">
              <Bell className="w-5 h-5 cursor-pointer hover:text-brand-navy smooth-hover" />
              <MessageSquare className="w-5 h-5 cursor-pointer hover:text-brand-navy smooth-hover" />
              
              <div className="group relative">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0)}
                  </div>
                </div>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4 border-b border-gray-50">
                    <p className="text-sm font-bold text-brand-navy truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
