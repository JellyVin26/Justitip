"use client";
import { Search } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <section className="mb-14">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Global <span className="italic text-gray-500 font-serif">Marketplace.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse items requested by buyers around the world, or list an item you want someone to buy for you.
        </p>
        
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search for items..."
            className="w-full pl-12 pr-32 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
          />
          <button className="absolute inset-y-2 right-2 bg-brand-navy text-white px-6 rounded text-sm font-medium hover:bg-gray-800 smooth-hover">
            Search
          </button>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-sm">We are currently building out the full marketplace experience.</p>
      </section>
    </div>
  );
}
