"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

export default function SellerOrderDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [markupType, setMarkupType] = useState('fixed'); // 'fixed' or 'percentage'
  
  const [pricingForm, setPricingForm] = useState({
    originalPrice: 0,
    markupValue: 0,
    exchangeRate: 1
  });

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orderId = params.id as string;

  const STATUS_OPTIONS = [
    'REQUEST_SUBMITTED',
    'TRIP_CONFIRMED',
    'PAID',
    'ITEM_PURCHASED',
    'IN_TRANSIT',
    'DELIVERED'
  ];

  useEffect(() => {
    const fetchOrderAndMessages = async () => {
      try {
        const [orderRes, messagesRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/orders/${orderId}/messages`)
        ]);
        setOrder(orderRes.data);
        setMessages(messagesRes.data);
        setPricingForm({
          originalPrice: orderRes.data.originalPrice || orderRes.data.estimatedPrice || 0,
          markupValue: orderRes.data.markupFee || 0,
          exchangeRate: orderRes.data.exchangeRate || 1
        });
        if (orderRes.data.paymentQrUrl) {
          setQrUrl(orderRes.data.paymentQrUrl);
        }

        // Fetch live exchange rate based on localCurrency
        const currency = orderRes.data.localCurrency || 'USD';
        try {
          const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
          const rateData = await rateRes.json();
          const idrRate = rateData.rates['IDR'];
          if (idrRate) {
            setPricingForm(prev => ({ ...prev, exchangeRate: idrRate }));
          }
        } catch (err) {
          console.error("Failed to fetch exchange rate", err);
        }

      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderAndMessages();
    }
  }, [orderId]);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join_order_room', orderId);
    });

    socketRef.current.on('receive_message', (data: any) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const messageData = {
      orderId,
      senderId: user.id,
      content: newMessage,
      createdAt: new Date().toISOString()
    };
    
    socketRef.current?.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrder({ ...order, status: res.data.status });
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingPrice(true);
      
      const originalPriceUSD = Number(pricingForm.originalPrice);
      const exchangeRate = Number(pricingForm.exchangeRate);
      
      // Calculate absolute markup fee in IDR
      let absoluteMarkupFeeIDR = 0;
      if (markupType === 'percentage') {
        const itemPriceIDR = originalPriceUSD * exchangeRate;
        absoluteMarkupFeeIDR = itemPriceIDR * (Number(pricingForm.markupValue) / 100);
      } else {
        absoluteMarkupFeeIDR = Number(pricingForm.markupValue);
      }

      const res = await api.patch(`/orders/${orderId}/pricing`, {
        originalPrice: originalPriceUSD,
        markupFee: absoluteMarkupFeeIDR,
        shippingFee: 0, // Removed shipping fee
        exchangeRate: exchangeRate,
        paymentQrUrl: qrUrl || undefined
      });
      setOrder(res.data);
      alert('Pricing and QR Code updated successfully!');
    } catch (err) {
      console.error('Failed to update pricing', err);
      alert('Failed to update pricing.');
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setQrUrl(res.data.url);
    } catch (err) {
      console.error('Failed to upload QR code', err);
      alert('Failed to upload image.');
    } finally {
      setUploadingQr(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div></div>;
  if (!order) return <div className="text-center py-20 text-gray-500 font-medium">Order not found</div>;
  if (user && order.trip?.sellerId !== user.id) return <div className="text-center py-20 text-red-500 font-bold text-lg tracking-wide uppercase">Unauthorized. You are not the seller of this order.</div>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/seller/orders" className="text-gray-500 text-xs font-bold tracking-wider flex items-center gap-1 hover:text-brand-navy mb-2 transition-colors">
          <ArrowLeft className="w-3 h-3" /> BACK TO ORDERS
        </Link>
        <h1 className="text-3xl font-bold text-brand-navy mb-1 tracking-tight">Manage Order #{order.id.slice(0,8).toUpperCase()}</h1>
        <p className="text-sm text-gray-600 font-medium">Trip: <span className="font-bold text-brand-navy">{order.trip.destinationCountry}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details & Status Management */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Item Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1 shadow-sm">
              <div className="flex gap-5 mb-8">
                <div className="flex flex-col justify-center">
                  <h2 className="text-xl font-bold text-brand-navy leading-tight mb-2 tracking-tight">{order.productName}</h2>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-brand-navy text-lg">{order.originalPrice ? `${order.localCurrency || 'USD'} ${order.originalPrice}` : 'Price Pending'}</p>
                    <div className="bg-brand-navy/5 text-brand-navy px-2.5 py-0.5 rounded text-xs font-bold tracking-wide">QTY: {order.quantity}</div>
                  </div>
                </div>
              </div>
            <hr className="border-gray-100 mb-5" />

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Buyer</span>
                <span className="font-bold flex items-center gap-2 text-brand-navy">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                     {order.buyer?.name?.charAt(0) || 'B'}
                  </div>
                  {order.buyer?.name || 'Buyer'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Order Placed On</span>
                <span className="font-bold text-brand-navy">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            </div>

            {/* Status Management Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1 shadow-sm flex flex-col justify-center">
              <h3 className="font-bold text-brand-navy mb-2 tracking-tight text-lg text-center">Order Status</h3>
              <div className="flex justify-center mb-6">
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase border border-blue-100">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              
              {(() => {
                const currentIndex = STATUS_OPTIONS.indexOf(order.status);
                const nextStatus = currentIndex >= 0 && currentIndex < STATUS_OPTIONS.length - 1 ? STATUS_OPTIONS[currentIndex + 1] : null;
                
                if (!nextStatus) {
                  return (
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="font-bold text-green-700">Order Completed</p>
                      <p className="text-xs text-green-600 mt-1">This order has been successfully delivered.</p>
                    </div>
                  );
                }

                const getNextStatusText = (status: string) => {
                  switch (status) {
                    case 'TRIP_CONFIRMED': return 'Confirm Trip';
                    case 'PAID': return 'Awaiting Payment'; // Add mapping for PAID? Wait, seller doesn't transition to PAID. Buyer transitions to PAID!
                    case 'ITEM_PURCHASED': return 'Mark Item as Purchased';
                    case 'IN_TRANSIT': return 'Mark as In Transit';
                    case 'DELIVERED': return 'Mark as Delivered';
                    default: return `Update to ${status.replace('_', ' ')}`;
                  }
                };

                return (
                  <div className="mt-auto">
                    <p className="text-xs text-gray-500 text-center mb-3 font-medium">Next step in the process:</p>
                    {nextStatus === 'PAID' ? (
                      <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="font-bold text-yellow-700">Awaiting Buyer Payment</p>
                        <p className="text-xs text-yellow-600 mt-1">Waiting for the buyer to scan and pay.</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(nextStatus)}
                        disabled={updatingStatus}
                        className="w-full bg-brand-navy text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {updatingStatus ? 'UPDATING...' : getNextStatusText(nextStatus)}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Pricing Management Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-brand-navy tracking-tight text-lg">Pricing & Fees</h3>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Buyer's Estimated Price</p>
                <p className="font-bold text-gray-700">{order.estimatedPrice ? `${order.localCurrency || 'USD'} ${order.estimatedPrice}` : 'N/A'}</p>
              </div>
            </div>
            
            <form onSubmit={handleUpdatePricing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1 h-7">
                    <label className="block text-xs font-bold text-gray-700">Actual Item Price ({order.localCurrency || 'USD'})</label>
                  </div>
                  <input 
                    type="number" 
                    value={pricingForm.originalPrice}
                    onChange={(e) => setPricingForm({...pricingForm, originalPrice: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-accent text-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 h-7">
                    <label className="block text-xs font-bold text-gray-700">Your Markup Fee</label>
                    <div className="flex bg-gray-100 rounded p-0.5">
                      <button type="button" onClick={() => setMarkupType('fixed')} className={`text-[10px] px-2 py-0.5 rounded font-bold ${markupType === 'fixed' ? 'bg-white shadow text-brand-navy' : 'text-gray-500'}`}>IDR</button>
                      <button type="button" onClick={() => setMarkupType('percentage')} className={`text-[10px] px-2 py-0.5 rounded font-bold ${markupType === 'percentage' ? 'bg-white shadow text-brand-navy' : 'text-gray-500'}`}>%</button>
                    </div>
                  </div>
                  <div className="relative">
                    {markupType === 'fixed' && <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">Rp</span>}
                    <input 
                      type="number" 
                      value={pricingForm.markupValue}
                      onChange={(e) => setPricingForm({...pricingForm, markupValue: parseFloat(e.target.value)})}
                      className={`w-full py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-accent text-sm ${markupType === 'fixed' ? 'pl-8 pr-3' : 'px-3'}`}
                    />
                    {markupType === 'percentage' && <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">%</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-2">Upload Payment QR Code (Optional)</label>
                <div className="flex items-center gap-4">
                  {qrUrl && (
                    <img src={qrUrl} alt="QR Code" className="w-16 h-16 object-cover rounded border border-gray-200" />
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={uploadingQr}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-navy/10 file:text-brand-navy hover:file:bg-brand-navy/20 cursor-pointer transition-all"
                    />
                    {uploadingQr && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Charge to Buyer (Live IDR Rate)</p>
                  <p className="text-xl font-bold text-brand-accent">
                    Rp {(() => {
                      const basePrice = pricingForm.originalPrice * pricingForm.exchangeRate;
                      const markup = markupType === 'percentage' 
                        ? basePrice * (pricingForm.markupValue / 100) 
                        : pricingForm.markupValue;
                      return (basePrice + markup).toLocaleString('id-ID', {maximumFractionDigits: 0});
                    })()}
                  </p>
                </div>
                <button 
                  type="submit" 
                  disabled={updatingPrice}
                  className="bg-brand-navy text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {updatingPrice ? 'SAVING...' : 'SAVE PRICING'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Live Chat */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[600px]">
          {/* Chat Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold relative">
                 {order.buyer?.name?.charAt(0) || 'B'}
                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
               </div>
              <div>
                <h3 className="font-bold text-sm text-brand-navy leading-tight tracking-tight">{order.buyer?.name || 'Buyer'}</h3>
                <p className="text-[11px] text-gray-500 font-medium">Buyer</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm my-auto">No messages yet. Send an update!</div>
            ) : (
              messages.map((msg: any, idx: number) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={idx} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`p-3 text-sm shadow-sm ${isMe ? 'bg-brand-navy text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium tracking-wide">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-3">
              <button type="button" className="p-2 text-gray-400 hover:text-brand-accent transition-colors rounded-full hover:bg-gray-50">
                <Plus className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message buyer..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all" 
              />
              <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-brand-navy text-white rounded-full hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                 <svg className="w-5 h-5 transform rotate-90 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
