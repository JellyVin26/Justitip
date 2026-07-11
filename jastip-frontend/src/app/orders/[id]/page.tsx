import Link from 'next/link';
import { ArrowLeft, HelpCircle, Plus } from 'lucide-react';

export default function OrderDetailsPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Link href="/orders" className="text-gray-500 text-xs font-semibold tracking-wider flex items-center gap-1 hover:text-brand-navy mb-2">
            <ArrowLeft className="w-3 h-3" /> BACK TO ORDERS
          </Link>
          <h1 className="text-3xl font-bold text-brand-navy mb-1">Order #JT-882910</h1>
          <p className="text-sm text-gray-600">Estimated Arrival: <span className="font-semibold text-brand-navy">Oct 24, 2023</span></p>
        </div>
        <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           Purchase Protection Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details & Progress */}
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-6">
          
          {/* Item Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1 shadow-sm">
            <div className="flex gap-4 mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=200&q=80" alt="Tote Bag" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Luxury Accessories</p>
                <h2 className="text-xl font-bold text-brand-navy leading-tight mb-2">Marc Jacobs Large Tote Bag</h2>
                <p className="text-sm text-gray-500 mb-3">Color: Black | Size: Large</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-navy">$450.00</p>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">QTY: 1</div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 mb-4" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Shopper</span>
                <span className="font-semibold flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200"></div>
                  David Chen
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Origin</span>
                <span className="font-semibold">Paris, France</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destination</span>
                <span className="font-semibold">Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Delivery Progress Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1 shadow-sm">
            <h3 className="font-bold text-brand-navy mb-6">Delivery Progress</h3>
            
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
              
              {/* Step 1 */}
              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-brand-navy rounded-full -left-[9px] top-1 border-2 border-white ring-2 ring-brand-navy"></div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-brand-navy">In Transit</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded text-center leading-tight">OCT<br/>18</span>
                </div>
                <p className="text-sm text-gray-500">Shopper is currently traveling. Last check-in at Charles de Gaulle Airport.</p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-400">Item Purchased</h4>
                  <span className="text-gray-400 text-xs font-bold text-center leading-tight">OCT<br/>16</span>
                </div>
                <p className="text-sm text-gray-400">The Shopper has confirmed the purchase of your Marc Jacobs bag.</p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-400">Trip Confirmed</h4>
                  <span className="text-gray-400 text-xs font-bold text-center leading-tight">OCT<br/>14</span>
                </div>
                <p className="text-sm text-gray-400">David Chen accepted your request and shared his travel itinerary.</p>
              </div>

              {/* Step 4 */}
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-400">Request Submitted</h4>
                  <span className="text-gray-400 text-xs font-bold text-center leading-tight">OCT<br/>12</span>
                </div>
                <p className="text-sm text-gray-400">Order successfully placed on Justitip marketplace.</p>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column - Live Chat */}
        <div className="bg-slate-50 border border-indigo-100 rounded-xl shadow-sm flex flex-col overflow-hidden h-[600px]">
          {/* Chat Header */}
          <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://ui-avatars.com/api/?name=David+Chen&background=0D8ABC&color=fff" alt="David Chen" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-bold text-sm text-brand-navy leading-tight">David Chen</h3>
                <p className="text-xs text-gray-500">⭐ 4.9 (124 reviews)</p>
              </div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            
            {/* Incoming Message */}
            <div className="self-start max-w-[85%]">
              <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3 text-sm text-gray-700 shadow-sm">
                Hi! I just checked in at the airport. Everything is packed securely. I'll update you when I land!
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1 font-mono">10:45 AM</p>
            </div>

            {/* Incoming Image */}
            <div className="self-start max-w-[85%]">
              <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80" alt="Airport" className="rounded mb-2" />
                <p className="text-xs text-gray-600 px-1">Here's your bag safely packed!</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1 font-mono">10:46 AM</p>
            </div>

            {/* Outgoing Message */}
            <div className="self-end max-w-[85%]">
              <div className="bg-brand-navy text-white rounded-lg rounded-tr-none p-3 text-sm shadow-sm">
                Thank you so much, David! Safe travels. Can't wait to receive it.
              </div>
              <p className="text-[10px] text-gray-400 mt-1 mr-1 text-right font-mono">11:02 AM</p>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-brand-navy transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <input type="text" placeholder="Message David..." className="flex-1 bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent" />
            </div>
          </div>
          
          <button className="absolute bottom-4 right-8 bg-white border border-gray-200 shadow-lg text-brand-navy px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50">
            <HelpCircle className="w-4 h-4" /> Need Help?
          </button>
        </div>
      </div>
    </div>
  );
}
