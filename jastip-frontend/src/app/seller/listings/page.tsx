"use client";
import { useState } from 'react';
import AddListingModal from '@/components/AddListingModal';

export default function SellerListingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">My Listings</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-navy text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 smooth-hover tracking-wide">
          Add New Listing
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-2">You haven't listed any items</h2>
        <p className="text-gray-500 max-w-md">Start adding items you plan to buy on your next trip to attract buyers.</p>
      </div>

      <AddListingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      />
    </main>
  );
}
