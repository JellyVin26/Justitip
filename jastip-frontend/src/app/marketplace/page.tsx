"use client";
import { Search, Filter, MapPin, Package, ShieldCheck, Star } from 'lucide-react';

const mockListings = [
  {
    id: 'list-1',
    productName: 'Tokyo Banana - Original Flavor (8 pcs)',
    price: 15,
    localCurrency: 'USD',
    seller: 'Alex M.',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    verified: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1582283086938-163e9f45d5a7?w=300&q=80', 
    tripDestination: 'Tokyo, Japan',
    stockLeft: 10,
  },
  {
    id: 'list-2',
    productName: 'Gentle Monster Margiela Sunglasses',
    price: 320,
    localCurrency: 'USD',
    seller: 'Jessica L.',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    verified: true,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&q=80', 
    tripDestination: 'Seoul, South Korea',
    stockLeft: 2,
  },
  {
    id: 'list-3',
    productName: 'Pop Mart Hirono City of Mercy Blind Box',
    price: 18,
    localCurrency: 'USD',
    seller: 'Budi H.',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    verified: false,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80', 
    tripDestination: 'Shanghai, China',
    stockLeft: 15,
  },
  {
    id: 'list-4',
    productName: 'Glossier You Perfume 50ml',
    price: 68,
    localCurrency: 'USD',
    seller: 'Emily R.',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    verified: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&q=80', 
    tripDestination: 'New York City, USA',
    stockLeft: 5,
  },
  {
    id: 'list-5',
    productName: 'Nike Air Force 1 Low Off-White',
    price: 1200,
    localCurrency: 'USD',
    seller: 'Michael B.',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    verified: false,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80', 
    tripDestination: 'Paris, France',
    stockLeft: 1,
  },
  {
    id: 'list-6',
    productName: 'Blackmores Fish Oil 1000mg',
    price: 35,
    localCurrency: 'USD',
    seller: 'Sarah W.',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    verified: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=300&q=80', 
    tripDestination: 'Sydney, Australia',
    stockLeft: 20,
  }
];

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Available <span className="italic text-gray-500 font-serif">Items.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse exclusive items pre-listed by verified global couriers for their upcoming trips. Purchase directly from them and get it delivered fast.
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
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-brand-navy shadow-sm">All Items</button>
            <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700">Following</button>
          </div>

          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-50 smooth-hover shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Categories / Tags */}
      <div className="flex gap-3 overflow-x-auto pb-6 mb-8 hide-scrollbar">
        {['All Items', 'Trending', 'Electronics', 'Beauty', 'Fashion', 'Snacks & Food', 'Toys & Collectibles'].map((tag, i) => (
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

      {/* Results Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Showing {mockListings.length} available items</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select className="text-sm font-bold text-brand-navy bg-transparent outline-none cursor-pointer">
            <option>Newest First</option>
            <option>Lowest Price</option>
            <option>Highest Price</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockListings.map((listing) => (
          <div key={listing.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            
            {/* Image Header */}
            <div className="h-56 relative overflow-hidden bg-gray-100">
              <img src={listing.image} alt={listing.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              {/* Origin Badge */}
              <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-accent" /> From {listing.tripDestination}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-brand-navy text-lg leading-tight mb-2 line-clamp-2">
                  {listing.productName}
                </h3>
                <p className="font-black text-brand-accent text-2xl">
                  ${listing.price} <span className="text-sm text-gray-400 font-medium">({listing.localCurrency})</span>
                </p>
              </div>
              
              {/* Seller Info */}
              <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src={listing.sellerAvatar} alt={listing.seller} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                    {listing.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-brand-navy">{listing.seller}</p>
                      <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800">Follow</button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                      <span className="text-[10px] font-bold text-gray-700">{listing.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 justify-end">
                    <Package className="w-3.5 h-3.5" /> Stock
                  </p>
                  <p className="font-bold text-brand-navy text-sm leading-none mt-1">{listing.stockLeft} left</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <button className="w-full bg-brand-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm smooth-hover">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
      
      {/* Custom Request Banner */}
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-brand-navy mb-2">Can't find what you're looking for?</h3>
          <p className="text-blue-800/80 max-w-lg">
            You can still submit a custom request directly to a seller going to your desired country. Head over to the Trips page to browse active routes.
          </p>
        </div>
        <button className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-transparent smooth-hover whitespace-nowrap shadow-sm">
          Browse Trips
        </button>
      </div>

      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="bg-white border border-gray-200 text-brand-navy font-bold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-sm smooth-hover">
          Load More Items
        </button>
      </div>

    </div>
  );
}
