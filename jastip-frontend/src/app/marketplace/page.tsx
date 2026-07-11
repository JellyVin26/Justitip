"use client";
import { Search, Filter, MapPin, Package, Heart } from 'lucide-react';
import Image from 'next/image';

const mockRequests = [
  {
    id: 'req-1',
    productName: 'Tokyo Banana - Original Flavor x3',
    budget: 45,
    origin: 'Japan',
    destination: 'Jakarta, Indonesia',
    buyer: 'Sarah K.',
    buyerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1582283086938-163e9f45d5a7?w=300&q=80', // generic banana/sweets
    postedAt: '2 hours ago',
    offers: 2,
  },
  {
    id: 'req-2',
    productName: 'Glossier You Perfume 50ml',
    budget: 70,
    origin: 'USA',
    destination: 'Kuala Lumpur, MY',
    buyer: 'Amanda C.',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&q=80', // generic perfume
    postedAt: '4 hours ago',
    offers: 0,
  },
  {
    id: 'req-3',
    productName: 'Gentle Monster Margiela Sunglasses',
    budget: 350,
    origin: 'South Korea',
    destination: 'Bali, Indonesia',
    buyer: 'David W.',
    buyerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&q=80', // generic sunglasses
    postedAt: '5 hours ago',
    offers: 4,
  },
  {
    id: 'req-4',
    productName: 'Stanley Quencher H2.0 40oz (Pink)',
    budget: 55,
    origin: 'USA',
    destination: 'Manila, PH',
    buyer: 'Chloe T.',
    buyerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1606822350756-32d8478da257?w=300&q=80', // generic tumbler
    postedAt: '1 day ago',
    offers: 1,
  },
  {
    id: 'req-5',
    productName: 'Pop Mart Hirono City of Mercy Blind Box',
    budget: 20,
    origin: 'China',
    destination: 'Jakarta, Indonesia',
    buyer: 'Budi H.',
    buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80', // generic toy/box
    postedAt: '1 day ago',
    offers: 0,
  },
  {
    id: 'req-6',
    productName: 'Nike Air Force 1 Low Off-White',
    budget: 1500,
    origin: 'Europe',
    destination: 'Singapore',
    buyer: 'Jason L.',
    buyerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80', // generic sneakers
    postedAt: '2 days ago',
    offers: 5,
  }
];

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Buyer <span className="italic text-gray-500 font-serif">Requests.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse items that buyers around the world are looking for. Offer to purchase and deliver these items during your next trip to earn a commission.
        </p>
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by product name, brand, or country..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
            />
          </div>
          
          {/* Following Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-brand-navy shadow-sm">All Requests</button>
            <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700">Following</button>
          </div>

          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-50 smooth-hover shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Categories / Tags */}
      <div className="flex gap-3 overflow-x-auto pb-6 mb-8 hide-scrollbar">
        {['All Requests', 'High Commission', 'Electronics', 'Beauty', 'Fashion', 'Snacks & Food', 'Toys & Collectibles'].map((tag, i) => (
          <button 
            key={tag} 
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              i === 0 ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Showing {mockRequests.length} active requests</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select className="text-sm font-bold text-brand-navy bg-transparent outline-none cursor-pointer">
            <option>Newest First</option>
            <option>Highest Budget</option>
            <option>Most Offers</option>
          </select>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRequests.map((req) => (
          <div key={req.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
            
            {/* Image Header */}
            <div className="h-48 relative overflow-hidden bg-gray-100">
              <div className="absolute top-3 right-3 z-20">
                <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white smooth-hover shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <img src={req.image} alt={req.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              {/* Origin Badge */}
              <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-accent" /> From {req.origin}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-brand-navy text-base leading-snug line-clamp-2">
                  {req.productName}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Package className="w-4 h-4" />
                <span>Deliver to <span className="font-semibold text-gray-700">{req.destination}</span></span>
              </div>

              {/* Footer: Buyer & Budget */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <img src={req.buyerAvatar} alt={req.buyer} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-brand-navy">{req.buyer}</p>
                      <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800">Follow</button>
                    </div>
                    <p className="text-[10px] text-gray-400">{req.postedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Buyer Budget</p>
                  <p className="font-bold text-brand-navy text-lg leading-none">${req.budget}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                <button className="w-full bg-blue-50 text-blue-700 font-bold text-sm py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                  Offer to Deliver
                </button>
                {req.offers > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    {req.offers} seller{req.offers > 1 ? 's' : ''} offered
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
      
      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="bg-white border border-gray-200 text-brand-navy font-bold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-sm smooth-hover">
          Load More Requests
        </button>
      </div>

    </div>
  );
}
