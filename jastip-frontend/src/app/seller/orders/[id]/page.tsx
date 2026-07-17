"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Phone, Info, Paperclip, ImageIcon, Send, Check, ArrowRight } from 'lucide-react';
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
  const [markupType, setMarkupType] = useState('fixed'); 
  
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

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      setOrder({ ...order, status: res.data.status });
    } catch (err: any) {
      console.error('Failed to cancel order', err);
      alert(`Failed to cancel order: ${err.response?.data?.error || err.message}`);
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
        shippingFee: 0, 
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

  if (loading) return <div className="flex justify-center h-full items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div></div>;
  if (!order) return <div className="text-center py-20 text-gray-500 font-medium">Order not found</div>;
  if (user && order.trip?.sellerId !== user.id) return <div className="text-center py-20 text-red-500 font-bold text-lg tracking-wide uppercase">Unauthorized. You are not the seller of this order.</div>;

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-white">
      {/* Left Sidebar */}
      <div className="w-full md:w-[380px] lg:w-[450px] border-r border-gray-200 bg-white p-6 md:p-8 overflow-y-auto shrink-0 flex flex-col">
        {/* Item Info */}
        <div className="flex gap-4 mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
            {order.productUrl ? (
              <img src={order.productUrl} alt="Item" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center w-full">
            <div className="flex justify-between items-start w-full">
              <div className="self-start px-2 py-1 bg-amber-400 text-amber-900 text-[11px] font-bold rounded mb-2 leading-none">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </div>
              <div className="bg-brand-navy/5 text-brand-navy px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
                QTY: {order.quantity}
              </div>
            </div>
            <h2 className="font-bold text-gray-900 leading-tight text-[15px] mb-1.5">{order.productName}</h2>
            <p className="text-sm font-bold text-brand-navy">
              {order.originalPrice ? `${order.localCurrency || 'USD'} ${order.originalPrice}` : 'Price Pending'}
            </p>
          </div>
        </div>
        
        <div className="space-y-3 text-[13px] mb-8 pb-8 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Buyer</span>
            <span className="font-bold flex items-center gap-2 text-gray-900">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[9px]">
                 {order.buyer?.name?.charAt(0) || 'B'}
              </div>
              {order.buyer?.name || 'Buyer'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Order Placed On</span>
            <span className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Status Management */}
        {order.status === 'CANCELLED' ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 text-center">
            <h3 className="text-[14px] font-bold text-red-600 mb-2 tracking-wide uppercase">Order Status</h3>
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase border border-red-200 inline-block mb-3">
              CANCELLED
            </span>
            <p className="text-sm text-red-500 font-medium">This order has been cancelled and requires no further action.</p>
          </div>
        ) : (
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-gray-100 text-center relative">
          {(order.status === 'REQUEST_SUBMITTED' || order.status === 'TRIP_CONFIRMED') && (
            <button 
              onClick={handleCancelOrder}
              disabled={updatingStatus}
              className="absolute top-6 right-6 text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel Order
            </button>
          )}
          <h3 className="text-[14px] font-bold text-gray-900 mb-5 tracking-wide">Order Status</h3>
          <div className="flex justify-center mb-6">
            <span className="bg-blue-100/60 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase border border-blue-200">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          
          {(() => {
            const currentIndex = STATUS_OPTIONS.indexOf(order.status);
            const nextStatus = currentIndex >= 0 && currentIndex < STATUS_OPTIONS.length - 1 ? STATUS_OPTIONS[currentIndex + 1] : null;
            
            if (!nextStatus) {
              return (
                <div className="text-center mt-4">
                  <Check className="w-8 h-8 text-[#00a86b] mx-auto mb-2" />
                  <p className="font-bold text-[#00a86b] text-sm">Order Completed</p>
                </div>
              );
            }

            const getNextStatusText = (status: string) => {
              switch (status) {
                case 'TRIP_CONFIRMED': return 'Confirm Trip';
                case 'PAID': return 'Awaiting Payment';
                case 'ITEM_PURCHASED': return 'Mark as Purchased';
                case 'IN_TRANSIT': return 'Mark as In Transit';
                case 'DELIVERED': return 'Mark as Delivered';
                default: return `Update to ${status.replace('_', ' ')}`;
              }
            };

            return (
              <div className="mt-6 pt-4 border-t border-gray-200/60">
                <p className="text-[11px] text-gray-500 font-medium mb-3 uppercase tracking-wider">Next step in the process:</p>
                {nextStatus === 'PAID' ? (
                  <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="font-bold text-amber-700 text-sm">Awaiting Buyer Payment</p>
                    <p className="text-[11px] text-amber-600 mt-1">Waiting for the buyer to scan and pay.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(nextStatus)}
                    disabled={updatingStatus}
                    className="w-full bg-[#0A192F] text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updatingStatus ? 'UPDATING...' : getNextStatusText(nextStatus)}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
        )}

        {/* Pricing & Fees */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 tracking-wide text-[14px]">Pricing & Fees</h3>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Buyer's Est.</p>
              <p className="font-bold text-gray-800 text-sm">{order.estimatedPrice ? `${order.localCurrency || 'USD'} ${order.estimatedPrice}` : 'N/A'}</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdatePricing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Item Price ({order.localCurrency || 'USD'})</label>
                <input 
                  type="number" 
                  value={pricingForm.originalPrice}
                  onChange={(e) => setPricingForm({...pricingForm, originalPrice: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-sm transition-all"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">Markup Fee</label>
                  <div className="flex bg-gray-200/70 rounded p-0.5">
                    <button type="button" onClick={() => setMarkupType('fixed')} className={`text-[9px] px-2 py-0.5 rounded font-bold ${markupType === 'fixed' ? 'bg-white shadow-sm text-brand-navy' : 'text-gray-500'}`}>IDR</button>
                    <button type="button" onClick={() => setMarkupType('percentage')} className={`text-[9px] px-2 py-0.5 rounded font-bold ${markupType === 'percentage' ? 'bg-white shadow-sm text-brand-navy' : 'text-gray-500'}`}>%</button>
                  </div>
                </div>
                <div className="relative">
                  {markupType === 'fixed' && <span className="absolute left-3 top-3 text-[13px] font-bold text-gray-400">Rp</span>}
                  <input 
                    type="number" 
                    value={pricingForm.markupValue}
                    onChange={(e) => setPricingForm({...pricingForm, markupValue: parseFloat(e.target.value)})}
                    className={`w-full py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-sm transition-all ${markupType === 'fixed' ? 'pl-8 pr-3' : 'px-3'}`}
                  />
                  {markupType === 'percentage' && <span className="absolute right-3 top-3 text-[13px] font-bold text-gray-400">%</span>}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <label className="block text-[11px] font-bold text-gray-600 mb-2 uppercase tracking-wider">Upload Payment QR Code</label>
              <div className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" className="w-12 h-12 object-cover rounded bg-gray-50 border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-all"
                  />
                  {uploadingQr && <p className="text-[10px] text-gray-400 mt-1 font-medium">Uploading...</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Charge to Buyer</p>
                <p className="text-xl font-bold text-brand-navy tracking-tight">
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
                className="w-full bg-[#0A192F] text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {updatingPrice ? 'SAVING...' : 'SAVE PRICING'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8F9FA] relative">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold relative text-lg shrink-0 overflow-hidden">
              {order.buyer?.avatarUrl ? (
                <img src={order.buyer.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                order.buyer?.name?.charAt(0) || 'B'
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{order.buyer?.name || 'Buyer'}</h3>
              <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                Buyer
              </p>
            </div>
          </div>
          <div className="flex gap-5 text-gray-600">
            <button className="hover:text-gray-900 transition-colors"><Phone className="w-[22px] h-[22px]" strokeWidth={1.5} /></button>
            <button className="hover:text-gray-900 transition-colors"><Info className="w-[22px] h-[22px]" strokeWidth={1.5} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <div className="bg-gray-200/70 text-gray-700 text-[11px] font-bold tracking-wide px-4 py-1.5 rounded-full">
              Security Check: All payments must be made within the app.
            </div>
          </div>
          
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10 font-medium">No messages yet. Send an update!</div>
          ) : (
            messages.map((msg: any, idx: number) => {
              const isMe = msg.senderId === user?.id;
              
              const senderAvatar = isMe ? null : (order.buyer?.avatarUrl || null);
              const senderInitial = isMe ? null : (order.buyer?.name?.charAt(0) || 'B');
              
              return (
                <div key={idx} className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden mt-1">
                      {senderAvatar ? <img src={senderAvatar} alt="avatar" className="w-full h-full object-cover" /> : senderInitial}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 text-[15px] shadow-sm ${isMe ? 'bg-[#0A192F] text-white rounded-2xl rounded-tr-sm' : 'bg-[#EAECEF] text-gray-900 rounded-2xl rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 font-medium px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Chat Input */}
        <div className="bg-white p-4 border-t border-gray-100 pb-8 md:pb-4">
          <form 
            className="flex items-center gap-3 bg-[#F8F9FA] border border-gray-200 rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-brand-navy/10 focus-within:border-brand-navy/30 transition-all" 
            onSubmit={handleSendMessage}
          >
            <button type="button" className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
              <Paperclip className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 mr-1">
              <ImageIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-[15px] px-2 text-gray-800 placeholder-gray-400 h-10"
              placeholder="Message buyer..."
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-[#0A192F] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
