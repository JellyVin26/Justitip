"use client";
import { LayoutDashboard, Package, List, Wallet, Settings, Plus, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import PostTripModal from '@/components/PostTripModal';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostTripModalOpen, setIsPostTripModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const tripsResponse = await api.get(`/trips?sellerId=${user?.id}`);
      setUpcomingTrips(tripsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Seller'}</h1>
            <p className="text-gray-500">Here's what's happening with your deliveries today.</p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-md flex items-center gap-2 text-sm text-gray-600 shadow-sm font-mono">
            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Earnings Overview Card (Placeholder) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Total Earnings</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl font-bold text-brand-navy">$0.00</h2>
                  <span className="text-gray-400 text-sm font-bold">No data yet</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-brand-navy text-white rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Base Price</p>
                <p className="text-xl font-bold text-brand-navy">$0.00</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Markup (Profit)</p>
                <p className="text-xl font-bold text-brand-navy">$0.00</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Shipping Fees</p>
                <p className="text-xl font-bold text-brand-navy">$0.00</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Next Payout Card (Placeholder) */}
            <div className="bg-brand-navy rounded-xl p-8 shadow-sm relative overflow-hidden text-white flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-indigo-200 uppercase mb-2">Next Payout</p>
                <h2 className="text-4xl font-bold mb-6">$0.00</h2>
              </div>
              <button className="bg-white text-brand-navy font-bold text-sm w-full py-3 rounded-md hover:bg-gray-100 transition-colors">
                Setup Payouts
              </button>
            </div>

            {/* Pending Orders */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Pending Orders</p>
                <h2 className="text-3xl font-bold text-brand-navy">0</h2>
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
              <Link href="/seller/orders" className="text-sm text-gray-600 hover:text-brand-navy">View All &rarr;</Link>
            </div>
            
            <div className="bg-white border border-gray-200 p-8 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-bold text-gray-700">No active orders</p>
              <p className="text-sm text-gray-500">When buyers purchase your listings, they will appear here.</p>
            </div>
          </div>

          {/* Upcoming Trips List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-navy">Upcoming Trips</h3>
              <button onClick={() => setIsPostTripModalOpen(true)} className="text-sm text-gray-600 hover:text-brand-navy flex items-center gap-1"><Plus className="w-3 h-3"/> New Trip</button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
                </div>
              ) : upcomingTrips.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                  <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-bold text-gray-700">No upcoming trips</p>
                  <p className="text-sm text-gray-500 mb-4">Post your first trip to start earning.</p>
                  <button onClick={() => setIsPostTripModalOpen(true)} className="bg-brand-navy text-white px-4 py-2 rounded font-medium text-sm hover:bg-gray-800">Post Trip</button>
                </div>
              ) : (
                upcomingTrips.map(trip => (
                  <div key={trip.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="h-24 relative bg-brand-navy">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <div className="absolute bottom-3 left-4 z-20">
                        <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-1">{trip.destinationCountry}</h4>
                        <p className="text-gray-300 text-xs font-mono">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-mono">Status</p>
                          <p className="font-bold text-brand-navy text-sm">{trip.status}</p>
                        </div>
                      </div>
                      <Link href={`/seller/trips/${trip.id}`} className="bg-brand-navy text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
                        Manage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>

        <PostTripModal 
          isOpen={isPostTripModalOpen}
          onClose={() => setIsPostTripModalOpen(false)}
          onSuccess={() => {
            setIsPostTripModalOpen(false);
            fetchDashboardData();
          }}
        />
      </main>
    
  );
}
