"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

export default function OrderDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderAndMessages = async () => {
      try {
        const [orderRes, messagesRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/orders/${orderId}/messages`)
        ]);
        setOrder(orderRes.data);
        setMessages(messagesRes.data);
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

  const handleMarkAsPaid = async () => {
    try {
      setUpdatingPayment(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'PAID' });
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to mark as paid.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div></div>;
  if (!order) return <div className="text-center py-20 text-gray-500 font-medium">Order not found</div>;
  if (user && order.buyerId !== user.id) return <div className="text-center py-20 text-red-500 font-bold text-lg tracking-wide uppercase">Unauthorized. You are not the buyer of this order.</div>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Link href="/explore" className="text-gray-500 text-xs font-bold tracking-wider flex items-center gap-1 hover:text-brand-navy mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> BACK
          </Link>
          <h1 className="text-3xl font-bold text-brand-navy mb-1 tracking-tight">Order #{order.id.slice(0,8).toUpperCase()}</h1>
          <p className="text-sm text-gray-600 font-medium">Estimated Arrival: <span className="font-bold text-brand-navy">{new Date(order.trip.endDate).toLocaleDateString()}</span></p>
        </div>
        <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded flex items-center gap-2 text-xs font-bold tracking-widest uppercase shadow-sm">
           <ShieldCheck className="w-4 h-4" />
           Purchase Protection Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details & Progress */}
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-6">
          
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
                <span className="text-gray-500 font-medium">Shopper</span>
                <span className="font-bold flex items-center gap-2 text-brand-navy">
                  <div className="w-6 h-6 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px]">
                     {order.trip.seller?.name?.charAt(0) || 'S'}
                  </div>
                  {order.trip.seller?.name || 'Seller'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Destination</span>
                <span className="font-bold text-brand-navy">{order.trip.destinationCountry}</span>
              </div>
            </div>
          </div>

          {/* Delivery Progress Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1 shadow-sm">
            <h3 className="font-bold text-brand-navy mb-6 tracking-tight text-lg">Delivery Progress</h3>
            
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
              
              {(() => {
                const STATUS_OPTIONS = [
                  'REQUEST_SUBMITTED',
                  'TRIP_CONFIRMED',
                  'PAID',
                  'ITEM_PURCHASED',
                  'IN_TRANSIT',
                  'DELIVERED'
                ];
                const currentIndex = STATUS_OPTIONS.indexOf(order.status);
                const historySteps = STATUS_OPTIONS.slice(0, currentIndex + 1).reverse();
                
                return historySteps.map((status, idx) => {
                  const isCurrent = idx === 0;
                  
                  let timeDisplay = null;
                  const historyRecord = order.history?.find((h: any) => h.status === status);
                  if (historyRecord) {
                    timeDisplay = new Date(historyRecord.createdAt).toLocaleString(undefined, {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'});
                  } else if (isCurrent) {
                    timeDisplay = new Date(order.updatedAt).toLocaleString(undefined, {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'});
                  }

                  return (
                    <div key={status} className="relative pl-6">
                      {isCurrent ? (
                         <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white ring-2 ${status === 'DELIVERED' ? 'bg-green-500 ring-green-500' : 'bg-brand-navy ring-brand-navy'}`}></div>
                      ) : (
                         <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                      )}
                      
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-sm ${isCurrent ? 'text-brand-navy' : 'text-gray-400'}`}>
                           {status.replace('_', ' ')}
                        </h4>
                        {isCurrent && (
                          <span className="bg-brand-navy/10 text-brand-navy text-[10px] font-bold px-2 py-1 rounded text-center leading-tight uppercase tracking-widest">CURRENT</span>
                        )}
                        {!isCurrent && timeDisplay && (
                          <span className="text-gray-400 text-xs font-bold text-center leading-tight">{timeDisplay}</span>
                        )}
                      </div>
                      
                      {isCurrent && (
                         <div className="flex justify-between items-end mt-1">
                           <p className="text-sm text-gray-500 leading-relaxed">The order is currently in this stage.</p>
                           {timeDisplay && <span className="text-gray-400 text-xs font-bold text-center leading-tight">{timeDisplay}</span>}
                         </div>
                      )}
                    </div>
                  );
                });
              })()}

            </div>
          </div>

          {/* Payment Card */}
          {order.status === 'TRIP_CONFIRMED' && order.paymentQrUrl && (
            <div className="bg-white rounded-2xl border border-brand-navy p-6 flex-1 shadow-md relative overflow-hidden mt-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-navy"></div>
              <h3 className="font-bold text-brand-navy mb-2 tracking-tight text-lg">Make Payment</h3>
              <p className="text-sm text-gray-600 mb-6">The seller has confirmed the price and provided a payment QR code. Please complete the payment to proceed.</p>
              
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                <img src={order.paymentQrUrl} alt="Payment QR Code" className="w-48 h-48 object-cover rounded-lg shadow-sm border border-gray-200" />
                <p className="text-xs text-gray-400 mt-3 font-bold tracking-widest uppercase">Scan to Pay</p>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                 <p className="text-sm font-bold text-gray-500">Total Amount</p>
                 <p className="text-xl font-bold text-brand-navy">
                   Rp {order.totalPriceIdr?.toLocaleString('id-ID') || 0}
                 </p>
              </div>

              <button 
                onClick={handleMarkAsPaid}
                disabled={updatingPayment}
                className="w-full bg-brand-navy text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm tracking-wide text-sm disabled:opacity-50"
              >
                {updatingPayment ? 'UPDATING...' : 'I HAVE PAID'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Live Chat */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[600px]">
          {/* Chat Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold relative">
                 {order.trip.seller?.name?.charAt(0) || 'S'}
                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
               </div>
              <div>
                <h3 className="font-bold text-sm text-brand-navy leading-tight tracking-tight">{order.trip.seller?.name || 'Seller'}</h3>
                <p className="text-[11px] text-gray-500 font-medium">Shopper</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm my-auto">No messages yet. Say hello!</div>
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
                placeholder="Type your message..." 
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
