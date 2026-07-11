import { LayoutDashboard, Package, List, Wallet, Settings, Plus, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col pt-8">
        <div className="px-6 mb-8">
          <h2 className="text-sm font-bold text-brand-navy mb-1">Seller Studio</h2>
          <p className="text-xs text-gray-500 font-mono tracking-wider">Manage your deliveries</p>
        </div>
        
        <nav className="flex-1 space-y-1 px-4">
          <Link href="/seller/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-100 text-brand-navy rounded-md font-bold text-sm">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/seller/orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm smooth-hover">
            <Package className="w-5 h-5" /> Active Orders
          </Link>
          <Link href="/seller/listings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm smooth-hover">
            <List className="w-5 h-5" /> My Listings
          </Link>
          <Link href="/seller/wallet" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm smooth-hover">
            <Wallet className="w-5 h-5" /> Wallet
          </Link>
          <Link href="/seller/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm smooth-hover">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
        
        <div className="p-4">
          <button className="w-full bg-brand-navy text-white flex items-center justify-center gap-2 py-3 rounded-md font-medium text-sm hover:bg-gray-800 smooth-hover">
            <Plus className="w-4 h-4" /> Add New Listing
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#F8F9FA] p-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy mb-2">Welcome back, Alex</h1>
            <p className="text-gray-500">Here's what's happening with your deliveries today.</p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-md flex items-center gap-2 text-sm text-gray-600 shadow-sm font-mono">
            <Calendar className="w-4 h-4" /> Oct 12 - Oct 19, 2023
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Earnings Overview Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Total Earnings</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl font-bold text-brand-navy">$12,450.80</h2>
                  <span className="text-green-500 text-sm font-bold">↗ +14.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-brand-navy text-white rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Base Price</p>
                <p className="text-xl font-bold text-brand-navy">$9,240.00</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Markup (Profit)</p>
                <p className="text-xl font-bold text-brand-navy">$2,110.80</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Shipping Fees</p>
                <p className="text-xl font-bold text-brand-navy">$1,100.00</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Next Payout Card */}
            <div className="bg-brand-navy rounded-xl p-8 shadow-sm relative overflow-hidden text-white flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-indigo-200 uppercase mb-2">Next Payout</p>
                <h2 className="text-4xl font-bold mb-6">$2,140.00</h2>
              </div>
              <button className="bg-white text-brand-navy font-bold text-sm w-full py-3 rounded-md hover:bg-gray-100 transition-colors">
                Request Immediate Payout
              </button>
            </div>

            {/* Pending Orders */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Pending Orders</p>
                <h2 className="text-3xl font-bold text-brand-navy">08</h2>
              </div>
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Orders List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-navy">Active Orders</h3>
              <button className="text-sm text-gray-600 hover:text-brand-navy">View All &rarr;</button>
            </div>
            
            <div className="space-y-4">
              {/* Order 1 */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-gray-300 cursor-pointer transition-colors">
                <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=150&q=80" alt="Sony Headphones" className="w-16 h-16 rounded bg-gray-100 object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-brand-navy text-sm">Sony WH-1000XM5</h4>
                  <p className="text-xs text-gray-500 mb-1">Order #JT-99281 • USA &rarr; Indonesia</p>
                  <p className="text-xs text-gray-400">Buyer: Sarah K.</p>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">In Transit</span>
                  <p className="font-bold text-brand-navy text-sm">$450.00</p>
                  <p className="text-xs text-green-600 font-medium">Earned: $65.00</p>
                </div>
              </div>

              {/* Order 2 */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-gray-300 cursor-pointer transition-colors">
                <img src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=150&q=80" alt="Coffee Beans" className="w-16 h-16 rounded bg-gray-100 object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-brand-navy text-sm">Stumptown Coffee Beans x4</h4>
                  <p className="text-xs text-gray-500 mb-1">Order #JT-99304 • Germany &rarr; Jakarta</p>
                  <p className="text-xs text-gray-400">Buyer: Mike T.</p>
                </div>
                <div className="text-right">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Purchased</span>
                  <p className="font-bold text-brand-navy text-sm">$120.00</p>
                  <p className="text-xs text-green-600 font-medium">Earned: $18.50</p>
                </div>
              </div>

              {/* Order 3 */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-gray-300 cursor-pointer transition-colors">
                <img src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=150&q=80" alt="Watch" className="w-16 h-16 rounded bg-gray-100 object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-brand-navy text-sm">Tissot Gentleman Powermatic 80</h4>
                  <p className="text-xs text-gray-500 mb-1">Order #JT-99211 • Switzerland &rarr; Bandung</p>
                  <p className="text-xs text-gray-400">Buyer: Renaldi P.</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Delivered</span>
                  <p className="font-bold text-brand-navy text-sm">$820.00</p>
                  <p className="text-xs text-green-600 font-medium">Earned: $110.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Trips List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-navy">Upcoming Trips</h3>
              <button className="text-sm text-gray-600 hover:text-brand-navy flex items-center gap-1"><Plus className="w-3 h-3"/> New Trip</button>
            </div>

            <div className="space-y-4">
              {/* Trip 1 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="h-24 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80" alt="Tokyo" className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-4 z-20">
                    <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-1">Tokyo, Japan</h4>
                    <p className="text-gray-300 text-xs font-mono">Oct 24 - Oct 28</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-mono">Space</p>
                      <p className="font-bold text-brand-navy text-sm">8.5 / 10 kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-mono">Requests</p>
                      <p className="font-bold text-brand-navy text-sm">12 New</p>
                    </div>
                  </div>
                  <button className="bg-brand-navy text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800">
                    Manage
                  </button>
                </div>
              </div>

              {/* Trip 2 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm opacity-70">
                <div className="h-24 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80" alt="New York" className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-4 z-20">
                    <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-1">New York, USA</h4>
                    <p className="text-gray-300 text-xs font-mono">Nov 12 - Nov 18</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-mono">Space</p>
                      <p className="font-bold text-brand-navy text-sm">0 / 23 kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-mono">Requests</p>
                      <p className="font-bold text-brand-navy text-sm">0 New</p>
                    </div>
                  </div>
                  <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50">
                    Manage
                  </button>
                </div>
              </div>

            </div>
          </div>
          
        </div>

      </main>
    </div>
  );
}
