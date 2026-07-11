"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, UserCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname ? (pathname === path || pathname.startsWith(path + '/')) : false;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-8">
      {/* Left side */}
      <div className="flex items-center gap-10">
        <Link href="/" className="text-2xl font-bold tracking-tight text-brand-navy">
          Justitip
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/marketplace" className={isActive('/marketplace') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Marketplace</Link>
          <Link href="/explore" className={isActive('/explore') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Explore</Link>
          <Link href="/trips" className={isActive('/trips') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Trips</Link>
          <Link href="/orders" className={isActive('/orders') ? "text-brand-navy font-semibold border-b-2 border-brand-navy pb-5 translate-y-[10px]" : "hover:text-brand-navy smooth-hover"}>Orders</Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <Link href="/seller" className="text-sm font-medium text-gray-600 hover:text-brand-navy smooth-hover">
          Become a Seller
        </Link>
        <button className="bg-brand-navy text-white px-5 py-2 rounded font-medium text-sm hover:bg-gray-800 smooth-hover tracking-wider">
          POST TRIP
        </button>
        <div className="flex items-center gap-4 text-gray-500">
          <Bell className="w-5 h-5 cursor-pointer hover:text-brand-navy smooth-hover" />
          <MessageSquare className="w-5 h-5 cursor-pointer hover:text-brand-navy smooth-hover" />
          <UserCircle className="w-6 h-6 cursor-pointer hover:text-brand-navy smooth-hover" />
        </div>
      </div>
    </nav>
  );
}
