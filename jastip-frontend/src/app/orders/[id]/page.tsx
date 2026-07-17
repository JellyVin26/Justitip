"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Phone, Info, Paperclip, ImageIcon, Send, Check, ArrowRight, Star } from 'lucide-react';
import api from '@/lib/api';
import ReviewModal from '@/components/ReviewModal';
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
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

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      setOrder(res.data);
    } catch (err: any) {
      console.error('Failed to cancel order', err);
      alert(`Failed to cancel order: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="flex justify-center h-[calc(100vh-64px)] items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div></div>;
  if (!order) return <div className="text-center py-20 text-gray-500 font-medium">Order not found</div>;
  if (user && order.buyerId !== user.id) return <div className="text-center py-20 text-red-500 font-bold text-lg tracking-wide uppercase">Unauthorized. You are not the buyer of this order.</div>;

  const STATUS_STAGES = [
    { key: 'REQUEST_SUBMITTED', label: 'Request Submitted' },
    { key: 'TRIP_CONFIRMED', label: 'Trip Confirmed' },
    { key: 'WAITING_PAYMENT', label: 'Awaiting Payment', actionRequired: true },
    { key: 'ITEM_PURCHASED', label: 'Item Purchased' },
    { key: 'IN_TRANSIT', label: 'In Transit' }
  ];

  let activeStageIndex = 0;
  switch (order.status) {
    case 'REQUEST_SUBMITTED': activeStageIndex = 0; break;
    case 'TRIP_CONFIRMED': activeStageIndex = 2; break; // Waiting for payment
    case 'PAID': activeStageIndex = 3; break;
    case 'ITEM_PURCHASED': activeStageIndex = 3; break;
    case 'IN_TRANSIT': activeStageIndex = 4; break;
    case 'DELIVERED': activeStageIndex = 5; break;
    default: activeStageIndex = 0;
  }

  const getHistoryDate = (statusKey: string) => {
    const record = order.history?.find((h: any) => h.status === statusKey);
    if (record) {
      return new Date(record.createdAt).toLocaleString(undefined, {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'});
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Left Sidebar */}
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-gray-200 bg-white p-6 md:p-8 overflow-y-auto shrink-0 flex flex-col">
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
          <div className="flex flex-col justify-center">
            <div className="self-start px-2 py-1 bg-amber-400 text-amber-900 text-[11px] font-bold rounded mb-2 leading-none">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </div>
            <h2 className="font-bold text-gray-900 leading-tight text-[15px] mb-1.5">{order.productName}</h2>
            <p className="text-sm text-gray-500 font-medium">From {order.trip?.destinationCountry || 'Japan'}</p>
          </div>
        </div>

        {order.status === 'CANCELLED' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 text-center">
            <h3 className="text-red-600 font-bold text-lg mb-1">Order Cancelled</h3>
            <p className="text-sm text-red-400 font-medium">This order has been cancelled and can no longer be processed.</p>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <h3 className="text-[13px] font-bold text-gray-900 mb-5 tracking-wide">Payment Summary</h3>
          <div className="space-y-3.5 text-sm mb-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Local Item Price</span>
              <span className="font-bold text-gray-900">{order.localCurrency || 'USD'} {order.originalPrice?.toLocaleString() || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Shopper Markup (15%)</span>
              <span className="font-bold text-gray-900">{order.localCurrency || 'USD'} {((order.originalPrice || 0) * 0.15).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Global Shipping</span>
              <span className="font-bold text-gray-900">{order.localCurrency || 'USD'} 45.00</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-[15px]">Total Amount</span>
            <span className="font-bold text-gray-900 text-2xl tracking-tight">
              {order.localCurrency || 'USD'} {((order.originalPrice || 0) * 1.15 + 45).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        {order.status !== 'CANCELLED' && (
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase">Order Progress</h3>
            {(order.status === 'REQUEST_SUBMITTED' || order.status === 'TRIP_CONFIRMED') && (
              <button 
                onClick={handleCancelOrder}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg"
              >
                Cancel Order
              </button>
            )}
          </div>
          <div className="space-y-0 relative ml-3">
            {STATUS_STAGES.map((stage, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isActive = idx === activeStageIndex;
              const isPending = idx > activeStageIndex;
              
              const historyDate = getHistoryDate(stage.key === 'WAITING_PAYMENT' ? 'TRIP_CONFIRMED' : stage.key);
              
              return (
                <div key={stage.key} className="relative pl-8 pb-8 last:pb-0">
                  {/* Vertical Line */}
                  {idx !== STATUS_STAGES.length - 1 && (
                    <div className={`absolute left-[11.5px] top-7 bottom-0 w-[2px] ${idx < activeStageIndex - 1 ? 'bg-[#00a86b]' : 'bg-gray-200'}`}></div>
                  )}
                  
                  {/* Dot / Icon */}
                  <div className="absolute left-0 top-0.5">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-[#00a86b] text-white flex items-center justify-center relative z-10 ring-4 ring-white">
                         <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    ) : isActive && stage.key === 'WAITING_PAYMENT' ? (
                      <div className="w-6 h-6 rounded-full bg-[#00a86b] flex items-center justify-center relative z-10 ring-4 ring-white">
                         <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    ) : isActive ? (
                      <div className="w-6 h-6 rounded-full border-2 border-brand-navy bg-white flex items-center justify-center relative z-10 ring-4 ring-white">
                         <div className="w-2 h-2 bg-brand-navy rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-white relative z-10 ring-4 ring-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-0.5">
                    <h4 className={`text-[15px] font-bold ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stage.label}
                    </h4>
                    {isCompleted && historyDate && (
                       <p className="text-[13px] text-gray-500 mt-1 font-medium">{historyDate}</p>
                    )}
                    {isActive && !isCompleted && !stage.actionRequired && (
                       <p className="text-[13px] text-gray-500 mt-1 font-medium">In progress...</p>
                    )}
                    {isActive && stage.actionRequired && (
                      <div className="mt-2">
                        <p className="text-[13px] font-bold text-gray-900 mb-3">Action Required</p>
                        {stage.key === 'WAITING_PAYMENT' && (
                          <button 
                            onClick={handleMarkAsPaid}
                            disabled={updatingPayment}
                            className="bg-[#0A192F] text-white text-[15px] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {updatingPayment ? 'Processing...' : 'Pay Now'} {!updatingPayment && <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        )}

        {/* Review Section */}
        {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && !order.review && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full bg-brand-navy text-white text-[15px] font-bold px-6 py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Rate Your Experience
            </button>
          </div>
        )}
        {order.review && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-[13px] font-bold text-gray-900 mb-2 tracking-wide uppercase">Your Review</h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < order.review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
              ))}
            </div>
            {order.review.comment && <p className="text-[13px] text-gray-600 italic">"{order.review.comment}"</p>}
          </div>
        )}
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8F9FA] relative">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold relative text-lg shrink-0 overflow-hidden">
              {order.trip.seller?.avatarUrl ? (
                <img src={order.trip.seller.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                order.trip.seller?.name?.charAt(0) || 'S'
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{order.trip.seller?.name || 'Seller'}</h3>
              <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                Verified Shopper <span className="text-gray-300">•</span> 4.9 ★
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
            <div className="text-center text-gray-400 text-sm mt-10 font-medium">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg: any, idx: number) => {
              const isMe = msg.senderId === user?.id;
              
              // Find avatar if not me
              const senderAvatar = isMe ? null : (order.trip.seller?.avatarUrl || null);
              const senderInitial = isMe ? null : (order.trip.seller?.name?.charAt(0) || 'S');
              
              return (
                <div key={idx} className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden mt-1">
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
              placeholder="Type a message..."
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
      
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={order.id}
        sellerName={order.trip.seller?.name || 'Seller'}
        onSuccess={() => {
          // Refresh order data
          api.get(`/orders/${orderId}`).then(res => setOrder(res.data));
        }}
      />
    </div>
  );
}
