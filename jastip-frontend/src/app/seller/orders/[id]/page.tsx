"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Phone, Info, Paperclip, Image as ImageIcon, Send, Check, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";

export default function SellerOrderDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [markupType, setMarkupType] = useState("fixed");

  const [pricingForm, setPricingForm] = useState({
    originalPrice: 0,
    markupValue: 0,
    exchangeRate: 1,
  });

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orderId = params.id as string;

  const STATUS_OPTIONS = [
    "REQUEST_SUBMITTED",
    "TRIP_CONFIRMED",
    "PAID",
    "ITEM_PURCHASED",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
  ];

  useEffect(() => {
    const fetchOrderAndMessages = async () => {
      try {
        const [orderRes, messagesRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/orders/${orderId}/messages`),
        ]);
        setOrder(orderRes.data);
        setMessages(messagesRes.data);
        setPricingForm({
          originalPrice: orderRes.data.originalPrice || orderRes.data.estimatedPrice || 0,
          markupValue: orderRes.data.markupFee || 0,
          exchangeRate: orderRes.data.exchangeRate || 1,
        });
        if (orderRes.data.paymentQrUrl) {
          setQrUrl(orderRes.data.paymentQrUrl);
        }

        const currency = orderRes.data.localCurrency || "USD";
        try {
          const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
          const rateData = await rateRes.json();
          const idrRate = rateData.rates["IDR"];
          if (idrRate) {
            setPricingForm((prev) => ({ ...prev, exchangeRate: idrRate }));
          }
        } catch (err) {
          console.error("Failed to fetch exchange rate", err);
        }
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

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrder({ ...order, status: res.data.status });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: "CANCELLED" });
      setOrder({ ...order, status: res.data.status });
    } catch (err: any) {
      console.error("Failed to cancel order", err);
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
      if (markupType === "percentage") {
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
        paymentQrUrl: qrUrl || undefined,
      });
      setOrder(res.data);
      alert("Pricing and QR code updated successfully!");
    } catch (err) {
      console.error("Failed to update pricing", err);
      alert("Failed to update pricing.");
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
      formData.append("file", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQrUrl(res.data.url);
    } catch (err) {
      console.error("Failed to upload QR code", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingQr(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500"></div></div>;
  if (!order) return <div className="py-20 text-center text-zinc-400">Order not found</div>;
  if (user && order.trip?.sellerId !== user.id) return <div className="py-20 text-center text-lg font-bold uppercase tracking-wide text-red-400">Unauthorized. You are not the seller of this order.</div>;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100 md:flex-row">
      {/* Left sidebar */}
      <div className="flex shrink-0 flex-col overflow-y-auto border-b border-white/5 p-6 md:w-[380px] md:border-b-0 md:border-r md:p-8 lg:w-[450px]">
        <Link href="/seller/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-200">
          <ArrowLeft size={16} /> Back to orders
        </Link>

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
          <div className="flex w-full flex-col justify-center">
            <div className="mb-2 flex w-full items-start justify-between">
              <div className="self-start rounded bg-amber-400 px-2 py-1 text-[11px] font-bold leading-none text-amber-950">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </div>
              <div className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-300">
                QTY: {order.quantity}
              </div>
            </div>
            <h2 className="mb-1.5 text-[15px] font-bold leading-tight text-zinc-100">{order.productName}</h2>
            <p className="text-sm font-bold text-emerald-400">
              {order.originalPrice ? `${order.localCurrency || "USD"} ${order.originalPrice}` : "Price pending"}
            </p>
          </div>
        </div>

        <div className="mb-8 space-y-3 border-b border-white/5 pb-8 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-500">Buyer</span>
            <span className="flex items-center gap-2 font-bold text-zinc-100">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] text-emerald-300">
                {order.buyer?.name?.charAt(0) || "B"}
              </div>
              {order.buyer?.name || "Buyer"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-500">Order placed on</span>
            <span className="font-bold text-zinc-100">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Status management */}
        {order.status === "CANCELLED" ? (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <h3 className="mb-2 text-[14px] font-bold uppercase tracking-wide text-red-400">Order status</h3>
            <span className="mb-3 inline-block rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-300">
              CANCELLED
            </span>
            <p className="text-sm font-medium text-red-300/70">This order has been cancelled and requires no further action.</p>
          </div>
        ) : (
          <div className="relative mb-8 rounded-2xl border border-white/5 bg-zinc-900 p-6 text-center">
            {order.status === "TRIP_CONFIRMED" && (
              <button
                onClick={handleCancelOrder}
                disabled={updatingStatus}
                className="absolute right-6 top-6 rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:text-red-300"
              >
                Cancel order
              </button>
            )}
            <h3 className="mb-5 text-[14px] font-bold tracking-wide text-zinc-100">Order status</h3>
            <div className="mb-6 flex justify-center">
              <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
                {order.status.replace("_", " ")}
              </span>
            </div>

            {(() => {
              const currentIndex = STATUS_OPTIONS.indexOf(order.status);
              const nextStatus = currentIndex >= 0 && currentIndex < STATUS_OPTIONS.length - 1 ? STATUS_OPTIONS[currentIndex + 1] : null;

              if (!nextStatus) {
                return (
                  <div className="mt-4 text-center">
                    <Check size={32} className="mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-400">Order completed</p>
                  </div>
                );
              }

              const getNextStatusText = (status: string) => {
                switch (status) {
                  case "TRIP_CONFIRMED": return "Accept order";
                  case "PAID": return "Awaiting payment";
                  case "ITEM_PURCHASED": return "Mark as purchased";
                  case "IN_TRANSIT": return "Mark as in transit";
                  case "DELIVERED": return "Mark as delivered";
                  case "COMPLETED": return "Mark as completed";
                  default: return `Update to ${status.replace("_", " ")}`;
                }
              };

              return (
                <div className="mt-6 border-t border-white/5 pt-4">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Next step in the process:</p>
                  {nextStatus === "PAID" ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                      <p className="text-sm font-bold text-amber-300">Awaiting buyer payment</p>
                      <p className="mt-1 text-[11px] text-amber-300/70">Waiting for the buyer to scan and pay.</p>
                    </div>
                  ) : order.status === "REQUEST_SUBMITTED" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelOrder}
                        disabled={updatingStatus}
                        className="flex-1 rounded-full border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-bold tracking-wide text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(nextStatus)}
                        disabled={updatingStatus}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {updatingStatus ? "Updating..." : "Accept order"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(nextStatus)}
                      disabled={updatingStatus}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {updatingStatus ? "Updating..." : getNextStatusText(nextStatus)}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Pricing & fees */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[14px] font-bold tracking-wide text-zinc-100">Pricing & fees</h3>
            <div className="text-right">
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Buyer's est.</p>
              <p className="text-sm font-bold text-zinc-300">
                {order.estimatedPrice ? `${order.localCurrency || "USD"} ${order.estimatedPrice}` : "N/A"}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePricing} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Item price ({order.localCurrency || "USD"})
                </label>
                <input
                  type="number"
                  value={pricingForm.originalPrice}
                  onChange={(e) => setPricingForm({ ...pricingForm, originalPrice: parseFloat(e.target.value) })}
                  className="input-base !bg-zinc-950 !border-zinc-700 !text-zinc-100"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Markup fee</label>
                  <div className="flex rounded bg-zinc-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => setMarkupType("fixed")}
                      className={`rounded px-2 py-0.5 text-[9px] font-bold ${markupType === "fixed" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500"}`}
                    >
                      IDR
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkupType("percentage")}
                      className={`rounded px-2 py-0.5 text-[9px] font-bold ${markupType === "percentage" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500"}`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <div className="relative">
                  {markupType === "fixed" && <span className="absolute left-3 top-3 text-[13px] font-bold text-zinc-500">Rp</span>}
                  <input
                    type="number"
                    value={pricingForm.markupValue}
                    onChange={(e) => setPricingForm({ ...pricingForm, markupValue: parseFloat(e.target.value) })}
                    className={`input-base !bg-zinc-950 !border-zinc-700 !text-zinc-100 ${markupType === "fixed" ? "!pl-9" : ""}`}
                  />
                  {markupType === "percentage" && <span className="absolute right-3 top-3 text-[13px] font-bold text-zinc-500">%</span>}
                </div>
              </div>
            </div>

            <div className="mt-2 pt-4">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Upload payment QR code</label>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-950 p-3">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" className="h-12 w-12 rounded bg-zinc-800 object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-zinc-800">
                    <ImageIcon size={20} className="text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                    className="w-full cursor-pointer text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-zinc-300 hover:file:bg-zinc-700"
                  />
                  {uploadingQr && <p className="mt-1 text-[10px] font-medium text-zinc-500">Uploading...</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total charge to buyer</p>
                <p className="text-xl font-extrabold tracking-tight text-emerald-400">
                  Rp{" "}
                  {(() => {
                    const basePrice = pricingForm.originalPrice * pricingForm.exchangeRate;
                    const markup =
                      markupType === "percentage"
                        ? basePrice * (pricingForm.markupValue / 100)
                        : pricingForm.markupValue;
                    return (basePrice + markup).toLocaleString("id-ID", { maximumFractionDigits: 0 });
                  })()}
                </p>
              </div>
              <button type="submit" disabled={updatingPrice} className="btn-dark w-full disabled:opacity-50">
                {updatingPrice ? "Saving..." : "Save pricing"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right chat area */}
      <div className="relative flex flex-1 flex-col bg-zinc-950">
        {/* Chat header */}
        <div className="z-10 flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 text-lg font-bold text-emerald-300">
              {order.buyer?.avatarUrl ? (
                <img src={order.buyer.avatarUrl} className="h-full w-full object-cover" alt="avatar" />
              ) : (
                order.buyer?.name?.charAt(0) || "B"
              )}
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold leading-tight text-zinc-100">{order.buyer?.name || "Buyer"}</h3>
              <p className="mt-0.5 text-[13px] font-medium text-zinc-500">Buyer</p>
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
            <div className="mt-10 text-center text-sm font-medium text-zinc-600">No messages yet. Send an update!</div>
          ) : (
            messages.map((msg: any, idx: number) => {
              const isMe = msg.senderId === user?.id;
              const senderAvatar = isMe ? null : order.buyer?.avatarUrl || null;
              const senderInitial = isMe ? null : order.buyer?.name?.charAt(0) || "B";

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
    </div>
  );
}
