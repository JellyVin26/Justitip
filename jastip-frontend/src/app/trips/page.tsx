"use client";
import { Search, Filter, Calendar, Weight, Star, ShieldCheck } from 'lucide-react';

const mockTrips = [
  {
    id: 'trip-1',
    destination: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    dates: 'Oct 24 - Oct 28',
    capacity: '8.5 / 15 kg',
    seller: 'Alex M.',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 4.9,
    reviews: 124,
    verified: true,
    tags: ['Electronics', 'Snacks', 'Figurines']
  },
  {
    id: 'trip-2',
    destination: 'Seoul, South Korea',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=80',
    dates: 'Nov 2 - Nov 10',
    capacity: '12 / 20 kg',
    seller: 'Jessica L.',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5.0,
    reviews: 89,
    verified: true,
    tags: ['Skincare', 'K-Pop Merch', 'Fashion']
  },
  {
    id: 'trip-3',
    destination: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e907614f77c?w=600&q=80',
    dates: 'Nov 15 - Nov 22',
    capacity: '2 / 10 kg',
    seller: 'Michael B.',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    rating: 4.7,
    reviews: 42,
    verified: false,
    tags: ['Luxury Bags', 'Perfume']
  },
  {
    id: 'trip-4',
    destination: 'New York City, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
    dates: 'Dec 1 - Dec 14',
    capacity: '20 / 30 kg',
    seller: 'Emily R.',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    rating: 4.8,
    reviews: 215,
    verified: true,
    tags: ['Sneakers', 'Streetwear', 'Vitamins']
  },
  {
    id: 'trip-5',
    destination: 'London, UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    dates: 'Dec 10 - Dec 18',
    capacity: '5 / 15 kg',
    seller: 'David K.',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 4.6,
    reviews: 28,
    verified: false,
    tags: ['Tea', 'Books', 'Clothing']
  },
  {
    id: 'trip-6',
    destination: 'Sydney, Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80',
    dates: 'Jan 5 - Jan 20',
    capacity: '15 / 25 kg',
    seller: 'Sarah W.',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    rating: 4.9,
    reviews: 156,
    verified: true,
    tags: ['Supplements', 'Skincare', 'Uggs']
  }
];

export default function TripsPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Available <span className="italic text-gray-500 font-serif">Trips.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse scheduled trips by verified global couriers. Request items from their destination and have them delivered safely to your doorstep.
        </p>
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by destination city or country..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
            />
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-50 smooth-hover shadow-sm">
            <Filter className="w-5 h-5" /> Filters
          </button>
          <button className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold tracking-wide hover:bg-gray-800 smooth-hover shadow-sm">
            Search
          </button>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Showing {mockTrips.length} active trips</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select className="text-sm font-bold text-brand-navy bg-transparent outline-none cursor-pointer">
            <option>Departure Date</option>
            <option>Highest Rating</option>
            <option>Most Capacity</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockTrips.map((trip) => (
          <div key={trip.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            
            {/* Destination Image */}
            <div className="h-48 relative overflow-hidden bg-gray-100">
              <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-white text-xl font-bold mb-1">{trip.destination}</h3>
                <div className="flex items-center gap-1.5 text-gray-200 text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md w-fit">
                  <Calendar className="w-3 h-3" /> {trip.dates}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col">
              
              {/* Seller Info */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={trip.sellerAvatar} alt={trip.seller} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                    {trip.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{trip.seller}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-bold text-gray-700">{trip.rating}</span>
                      <span className="text-[10px] text-gray-400">({trip.reviews})</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Capacity</p>
                  <p className="text-sm font-bold text-brand-navy flex items-center justify-end gap-1">
                    <Weight className="w-3.5 h-3.5 text-brand-accent" /> {trip.capacity}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6 flex-1">
                <p className="text-xs text-gray-500 mb-2 font-medium">Accepting requests for:</p>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button className="w-full bg-brand-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 smooth-hover flex items-center justify-center gap-2">
                  Request Item from {trip.seller.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
      
      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="bg-white border border-gray-200 text-brand-navy font-bold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-sm smooth-hover">
          Load More Trips
        </button>
      </div>

    </div>
  );
}
