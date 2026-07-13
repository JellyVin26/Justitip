"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Calendar, Package, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    estimatedPrice: '',
    localCurrency: 'USD',
    quantity: 1,
    category: 'Beauty & Cosmetics'
  });

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`/trips/${params.id}`);
        setTrip(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchTripDetails();
  }, [params.id]);

  const parseMarkupRules = (rules: any) => {
    try {
      if (typeof rules === 'string') {
        const parsed = JSON.parse(rules);
        return parsed.description || rules;
      }
      return rules?.description || 'Standard markup rules apply.';
    } catch {
      return rules || 'Standard markup rules apply.';
    }
  };

  const openModal = () => {
    if (!user) {
      alert("Please login as a buyer to request an item.");
      return router.push('/login');
    }
    setShowModal(true);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setCreatingOrder(true);
      const res = await api.post('/orders', {
        tripId: params.id,
        buyerId: user.id,
        productName: formData.productName,
        estimatedPrice: parseFloat(formData.estimatedPrice) || null,
        localCurrency: formData.localCurrency,
        quantity: Number(formData.quantity),
        category: formData.category
      });
      router.push(`/orders/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Failed to submit request.');
      setCreatingOrder(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
    </div>
  );
  
  if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
  if (!trip) return <div className="text-center py-20 font-bold text-gray-600">Trip not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <button 
        onClick={() => router.back()} 
        className="text-sm font-bold tracking-wide text-gray-500 hover:text-brand-navy mb-8 transition-colors"
      >
        &larr; BACK
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-72 relative bg-gray-100">
          <img 
            src={trip.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80'} 
            alt={trip.destinationCountry} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 z-10 text-white">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">{trip.destinationCountry}</h1>
            <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-white/90 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit">
              <Calendar className="w-4 h-4" />
              {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} 
              <span className="mx-1">-</span> 
              {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-brand-navy mb-4">About This Trip</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                {trip.notes || 'No specific notes provided for this trip.'}
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-accent" />
                Markup & Fees
              </h2>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-brand-navy font-bold text-sm">
                  {parseMarkupRules(trip.markupRules)}
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-6 relative">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 shrink-0 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-lg relative shadow-inner">
                  {trip.seller?.name?.charAt(0) || 'S'}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy tracking-tight">{trip.seller?.name || 'Verified Seller'}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="text-sm font-bold text-gray-700">5.0</span>
                    <span className="text-[11px] font-semibold text-gray-400">(24 completed trips)</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={openModal}
                className="w-full bg-brand-navy text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm tracking-wide text-sm"
              >
                REQUEST ITEM
              </button>
              <p className="text-[11px] font-medium text-center text-gray-400 mt-4 leading-relaxed px-4">
                Payment is secured by Justitip until you receive your item.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Request an Item</h2>
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                  placeholder="e.g. Rare Beauty Liquid Blush"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Price</label>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-accent/50 focus-within:border-brand-accent transition-all">
                    <select 
                      value={formData.localCurrency}
                      onChange={(e) => setFormData({...formData, localCurrency: e.target.value})}
                      className="bg-transparent pl-3 pr-2 py-3 border-r border-gray-200 text-sm font-bold text-brand-navy focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="SGD">SGD</option>
                      <option value="JPY">JPY</option>
                      <option value="AUD">AUD</option>
                    </select>
                    <input 
                      type="number" 
                      value={formData.estimatedPrice}
                      onChange={(e) => setFormData({...formData, estimatedPrice: e.target.value})}
                      className="w-full px-3 py-3 bg-transparent focus:outline-none"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                >
                  <option>Beauty & Cosmetics</option>
                  <option>Fashion & Apparel</option>
                  <option>Electronics</option>
                  <option>Food & Snacks</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={creatingOrder}
                  className="flex-1 px-4 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingOrder ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
