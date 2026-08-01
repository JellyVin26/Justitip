"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Info, Paperclip, Image as ImageIcon, Send, Check, ArrowRight, Star } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import ReviewModal from "@/components/ReviewModal";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
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
          api.get(`/orders/${orderId}/messages`),
        ]);
        setOrder(orderRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderAndMessages();
    }
  }, [orderId]);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000");

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join_order_room", orderId);
    });

    socketRef.current.on("receive_message", (data: any) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      orderId,
      senderId: user.id,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    socketRef.current?.emit("send_message", messageData);
    setNewMessage("");
  };

  const handleMarkAsPaid = async () => {
    try {
      setUpdatingPayment(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: "PAID" });
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to mark as paid.");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: "CANCELLED" });
      setOrder(res.data);
    } catch (err: any) {
      console.error("Failed to cancel order", err);
      alert(`Failed to cancel order: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-zinc-950"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500"></div></div>;
  if (!order) return <div className="bg-zinc-950 py-20 text-center font-medium text-zinc-400">Order not found</div>;
  if (user && order.buyerId !== user.id) return <div className="bg-zinc-950 py-20 text-center text-lg font-bold uppercase tracking-wide text-red-400">Unauthorized. You are not the buyer of this order.</div>;

  const STATUS_STAGES = [
    { key: "REQUEST_SUBMITTED", label: "Request submitted" },
    { key: "TRIP_CONFIRMED", label: "Trip confirmed" },
    { key: "PAID", label: "Payment confirmed" },
    { key: "ITEM_PURCHASED", label: "Item purchased" },
    { key: "IN_TRANSIT", label: "In transit" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const STATUS_INDEX: Record<string, number> = {
    REQUEST_SUBMITTED: 0,
    TRIP_CONFIRMED: 1,
    PAID: 2,
    ITEM_PURCHASED: 3,
    IN_TRANSIT: 4,
    DELIVERED: 5,
    COMPLETED: 5,
  };

  const activeStageIndex = STATUS_INDEX[order.status] ?? 0;
  const isWaitingPayment = order.status === "TRIP_CONFIRMED";

  const getHistoryDate = (statusKey: string) => {
    const record = order.history?.find((h: any) => h.status === statusKey);
    if (record) {
      return new Date(record.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    return null;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100 md:flex-row">
      {/* Left sidebar */}
      <div className="flex shrink-0 flex-col overflow-y-auto border-b border-white/5 p-6 md:w-[380px] md:border-b-0 md:border-r md:p-8 lg:w-[420px]">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Item info */}
        <div className="mb-8 flex gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
            {order.productImageUrl ? (
              <img src={order.productImageUrl} alt="Item" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                <ImageIcon size={30} className="opacity-50" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-2 self-start rounded bg-amber-400 px-2 py-1 text-[11px] font-bold leading-none text-amber-950">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </div>
            <h2 className="mb-1.5 text-[15px] font-bold leading-tight text-zinc-100">{order.productName}</h2>
            <p className="text-sm font-medium text-zinc-500">From {order.trip?.destinationCountry || "Japan"}</p>
          </div>
        </div>

        {order.status === "CANCELLED" && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <h3 className="mb-1 text-lg font-bold text-red-400">Order cancelled</h3>
            <p className="text-sm font-medium text-red-300/70">This order has been cancelled and can no longer be processed.</p>
          </div>
        )}

        {/* Payment summary */}
        <div className="mb-8 rounded-2xl border border-white/5 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[13px] font-bold tracking-wide text-zinc-100">Payment summary</h3>
            {order.totalPriceIdr ? (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">Confirmed quote</span>
            ) : (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">Estimated quote</span>
            )}
          </div>
          <div className="mb-5 space-y-3.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-500">Local item price ({order.quantity || 1}x)</span>
              <span className="font-bold text-zinc-100">{formatCurrency((order.originalPrice || order.estimatedPrice || 0) * (order.quantity || 1), order.localCurrency || "USD")}</span>
            </div>
            {order.totalPriceIdr ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-500">Shopper fee</span>
                  <span className="font-bold text-zinc-100">{formatCurrency(order.markupFee || 0, "IDR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-500">Shipping fee</span>
                  <span className="font-bold text-zinc-100">{formatCurrency(order.shippingFee || 0, "IDR")}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-500">Est. shopper fee (15%)</span>
                  <span className="font-bold text-zinc-100">{formatCurrency((order.originalPrice || order.estimatedPrice || 0) * 0.15 * (order.quantity || 1), order.localCurrency || "USD")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-500">Est. shipping</span>
                  <span className="font-bold text-zinc-100">{formatCurrency(45, order.localCurrency || "USD")}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-[15px] font-bold text-zinc-100">Total amount</span>
            <div className="text-right">
              {order.totalPriceIdr ? (
                <>
                  <div className="text-2xl font-bold tracking-tight text-zinc-100">{formatCurrency(order.totalPriceIdr, "IDR")}</div>
                  {order.totalPricePreferredCurrency && order.buyerPreferredCurrency !== "IDR" && (
                    <div className="mt-0.5 text-xs font-semibold text-zinc-500">
                      approx. {formatCurrency(order.totalPricePreferredCurrency, order.buyerPreferredCurrency)}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-2xl font-bold tracking-tight text-zinc-100">
                  {formatCurrency((order.originalPrice || order.estimatedPrice || 0) * 1.15 * (order.quantity || 1) + 45, order.localCurrency || "USD")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order progress */}
        {order.status !== "CANCELLED" && (
          <div className="flex-1">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-100">Order progress</h3>
              {(order.status === "REQUEST_SUBMITTED" || order.status === "TRIP_CONFIRMED") && (
                <button
                  onClick={handleCancelOrder}
                  className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:text-red-300"
                >
                  Cancel order
                </button>
              )}
            </div>
            <div className="relative ml-3 space-y-0">
              {STATUS_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeStageIndex;
                const isActive = idx === activeStageIndex;
                const isPending = idx > activeStageIndex;

                const historyDate = getHistoryDate(stage.key);

                return (
                  <div key={stage.key} className="relative pb-8 pl-8 last:pb-0">
                    {idx !== STATUS_STAGES.length - 1 && (
                      <div className={`absolute bottom-0 left-[11.5px] top-7 w-[2px] ${idx < activeStageIndex - 1 ? "bg-emerald-500/60" : "bg-zinc-800"}`} />
                    )}

                    <div className="absolute left-0 top-0.5">
                      {isCompleted ? (
                        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 ring-4 ring-zinc-950">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-zinc-950 ring-4 ring-zinc-950">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                      ) : (
                        <div className="relative z-10 h-6 w-6 rounded-full border-2 border-zinc-800 bg-zinc-950 ring-4 ring-zinc-950" />
                      )}
                    </div>

                    <div className="pt-0.5">
                      <h4 className={`text-[15px] font-bold ${isCompleted || isActive ? "text-zinc-100" : "text-zinc-600"}`}>
                        {stage.label}
                      </h4>
                      {isCompleted && historyDate && (
                        <p className="mt-1 text-[13px] font-medium text-zinc-500">{historyDate}</p>
                      )}
                      {isActive && !isCompleted && (
                        <p className="mt-1 text-[13px] font-medium text-zinc-500">
                          {isWaitingPayment && stage.key === "PAID" ? "Action required" : "In progress..."}
                        </p>
                      )}
                      {isActive && stage.key === "PAID" && isWaitingPayment && (
                        <div className="mt-2">
                          <button
                            onClick={handleMarkAsPaid}
                            disabled={updatingPayment}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-[15px] font-bold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-70"
                          >
                            {updatingPayment ? "Processing..." : "Pay now"} {!updatingPayment && <ArrowRight size={16} />}
                          </button>
                          <p className="mt-2 text-[11px] text-zinc-500">
                            Mark as paid after you've completed the in-app payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review section */}
        {(order.status === "COMPLETED" || order.status === "DELIVERED") && !order.review && (
          <div className="mt-8 border-t border-white/5 pt-6">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="btn-primary w-full"
            >
              Rate your experience
            </button>
          </div>
        )}
        {order.review && (
          <div className="mt-8 border-t border-white/5 pt-6">
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-zinc-100">Your review</h3>
            <div className="mb-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < order.review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"} />
              ))}
            </div>
            {order.review.comment && <p className="text-[13px] italic text-zinc-400">"{order.review.comment}"</p>}
          </div>
        )}
      </div>

      {/* Right chat area */}
      <div className="relative flex flex-1 flex-col bg-zinc-950">
        {/* Chat header */}
        <div className="z-10 flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3.5">
            <div
              className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 text-lg font-bold text-emerald-300"
              onClick={(e) => { e.stopPropagation(); router.push(`/seller/${order.trip.sellerId}`); }}
            >
              {order.trip.seller?.avatarUrl ? (
                <img src={order.trip.seller.avatarUrl} className="h-full w-full object-cover" alt="avatar" />
              ) : (
                order.trip.seller?.name?.charAt(0) || "S"
              )}
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500"></div>
            </div>
            <div className="flex flex-col">
              <h3
                className="cursor-pointer text-[15px] font-bold leading-tight text-zinc-100 hover:underline"
                onClick={(e) => { e.stopPropagation(); router.push(`/seller/${order.trip.sellerId}`); }}
              >
                {order.trip.seller?.name || "Seller"}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] font-medium text-zinc-500">
                Verified jastiper <span className="text-zinc-700">•</span> <Star size={11} className="fill-amber-400 text-amber-400" /> 4.9
              </p>
            </div>
          </div>
          <div className="flex gap-5 text-zinc-500">
            <button className="transition-colors hover:text-zinc-200"><Phone size={22} strokeWidth={1.5} /></button>
            <button className="transition-colors hover:text-zinc-200"><Info size={22} strokeWidth={1.5} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full bg-zinc-900 px-4 py-1.5 text-[11px] font-bold tracking-wide text-zinc-400">
              Security check: all payments must be made within the app.
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="mt-10 text-center text-sm font-medium text-zinc-600">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg: any, idx: number) => {
              const isMe = msg.senderId === user?.id;
              const senderAvatar = isMe ? null : order.trip.seller?.avatarUrl || null;
              const senderInitial = isMe ? null : order.trip.seller?.name?.charAt(0) || "S";

              return (
                <div key={idx} className={`flex max-w-[80%] gap-3 ${isMe ? "flex-row-reverse self-end" : "self-start"}`}>
                  {!isMe && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300">
                      {senderAvatar ? <img src={senderAvatar} alt="avatar" className="h-full w-full object-cover" /> : senderInitial}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-5 py-3.5 text-[15px] shadow-sm ${isMe ? "rounded-2xl rounded-tr-sm bg-emerald-500 text-zinc-950" : "rounded-2xl rounded-tl-sm bg-zinc-800 text-zinc-100"}`}>
                      {msg.content}
                    </div>
                    <p className="mt-2 px-1 text-[11px] font-medium text-zinc-600">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Chat input */}
        <div className="border-t border-white/5 bg-zinc-900/60 p-4 pb-8 backdrop-blur md:pb-4">
          <form
            className="flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 py-1.5 pl-4 pr-1.5 transition-all focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10"
            onSubmit={handleSendMessage}
          >
            <button type="button" className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-300">
              <Paperclip size={22} strokeWidth={1.5} />
            </button>
            <button type="button" className="mr-1 shrink-0 text-zinc-500 transition-colors hover:text-zinc-300">
              <ImageIcon size={22} strokeWidth={1.5} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="h-10 flex-1 bg-transparent px-2 text-[15px] text-zinc-100 placeholder-zinc-500 focus:outline-none"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={order.id}
        sellerName={order.trip.seller?.name || "Seller"}
        onSuccess={() => {
          api.get(`/orders/${orderId}`).then((res) => setOrder(res.data));
        }}
      />
    </div>
  );
}
