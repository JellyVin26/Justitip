"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, List, Plus } from 'lucide-react';
import Link from 'next/link';
import AddListingModal from '@/components/AddListingModal';

export default function ManageTripPage() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/seller/dashboard" className="text-sm text-gray-500 hover:text-brand-navy mb-2 block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-brand-navy">Manage Trip Details</h1>
        </div>
        <button className="bg-brand-navy text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 smooth-hover tracking-wide">
          Edit Trip Info
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
          <List className="w-12 h-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Trip Listings</h2>
          <p className="text-gray-500 mb-6 text-sm">Add items you are planning to buy on this trip.</p>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-accent text-brand-navy px-4 py-2 rounded-md font-bold text-sm hover:bg-orange-400">
            <Plus className="w-4 h-4" /> Add Listing
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Trip Orders</h2>
          <p className="text-gray-500 mb-6 text-sm">Review order requests from buyers for this specific trip.</p>
          <Link href="/seller/orders" className="text-brand-navy font-bold text-sm hover:underline">
            View Requests
          </Link>
        </div>
      </div>

      <AddListingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preSelectedTripId={id as string}
        onSuccess={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      />
    </main>
  );
}
