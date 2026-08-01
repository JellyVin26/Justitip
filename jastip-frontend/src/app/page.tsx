"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  Plane,
  ArrowRight,
  Package,
  ShoppingBag,
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  Receipt,
  Handshake,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);

  // Pull real upcoming trips for the hero preview
  useEffect(() => {
    api
      .get("/trips")
      .then((res) => setTrips(res.data?.slice(0, 3) || []))
      .catch(() => setTrips([]));
  }, []);

  const previewTrips =
    trips.length > 0
      ? trips
      : [
          {
            id: "1",
            destinationCountry: "Tokyo",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 6 * 86400000).toISOString(),
            seller: { name: "Ayu Travels", averageRating: 4.9, reviewCount: 32 },
          },
          {
            id: "2",
            destinationCountry: "Seoul",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 9 * 86400000).toISOString(),
            seller: { name: "Raka Finds", averageRating: 4.8, reviewCount: 18 },
          },
          {
            id: "3",
            destinationCountry: "Bangkok",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
            seller: { name: "Maya Picks", averageRating: 5.0, reviewCount: 9 },
          },
        ];

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-gold-400/15 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-[-5%] h-[360px] w-[360px] rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-2 md:pb-28 md:pt-24">
          {/* Left: copy */}
          <div className="animate-rise-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-300">
              <Sparkles size={14} /> Travelers shop. Justitipers deliver.
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl">
              Your go-to for hard-to-find finds,{" "}
              <span className="text-gold-400">from anywhere.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
              Justitip connects you with verified travelers who pick up items abroad and deliver them to your doorstep. No international shipping, no hassle.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary !px-8 !py-4 text-base">
                Start justitiping <ArrowRight size={18} />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-bold text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/5"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right: live preview (real trip cards) */}
          <div className="relative animate-rise-in [animation-delay:150ms]">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-gold-400/20 via-transparent to-amber-500/10 blur-2xl" />

            <div className="rounded-3xl border border-white/10 bg-navy-900/80 p-4 backdrop-blur-xl sm:p-5">
              <div className="mb-4 flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Live trips
                </p>
                <span className="flex items-center gap-1.5 rounded-full bg-gold-400/15 px-2.5 py-1 text-[10px] font-bold text-gold-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-300" /> 3 active
                </span>
              </div>

              <div className="space-y-3">
                {previewTrips.map((trip, i) => (
                  <div
                    key={trip.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-navy-950/60 p-4 transition-colors hover:border-white/10"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                      <MapPin size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-zinc-100">
                          {trip.destinationCountry}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star size={11} className="fill-current" />
                          {trip.seller?.averageRating?.toFixed?.(1) ?? "New"}
                        </span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar size={11} />
                        {new Date(trip.startDate).toLocaleDateString()} -{" "}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-zinc-400">
                        by {trip.seller?.name || "Verified justitiper"}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400 text-navy-950">
                      <ArrowRight size={15} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="border-t border-white/5 bg-navy-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            How justitiping works
          </h2>
          <p className="mt-3 max-w-lg text-zinc-400">
            A simple handoff between people who want things and people who are going places.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: <ShoppingBag size={22} />,
                title: "Browse trips",
                body: "Find a traveler headed to the country where the item you want lives.",
              },
              {
                icon: <Handshake size={22} />,
                title: "Request an item",
                body: "Send a request with a link or photo. The justitiper confirms price and markup.",
              },
              {
                icon: <Receipt size={22} />,
                title: "Pay & receive",
                body: "Pay safely in-app, track the order in chat, and get your item delivered.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-navy-900 p-6 transition-colors hover:border-gold-400/30"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                  {step.icon}
                </div>
                <h3 className="mb-2 font-bold text-zinc-100">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOR BUYERS ===== */}
      <section id="buyers" className="border-t border-white/5">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <div className="order-2 md:order-1">
            <div className="rounded-3xl border border-white/10 bg-navy-900 p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-400">
                <Package size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Buy from anywhere</h3>
              <ul className="mt-5 space-y-4">
                {[
                  "Snack runs, skincare, merch, limited drops. If it exists abroad, request it.",
                  "Get a confirmed quote before you pay. No surprise fees.",
                  "Chat with your justitiper from request to delivery.",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-400">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
                      <ArrowRight size={11} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/explore"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-gold-400 transition-colors hover:text-gold-300"
              >
                Explore trips <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-300">
              <ShoppingBag size={14} /> For buyers
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              That thing you can&apos;t get shipped? We&apos;ll get it to you.
            </h2>
            <p className="mt-4 max-w-md text-zinc-400">
              No international checkout drama, no forwarding services, no customs paperwork. Just a trusted traveler who brings it back in their luggage.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOR SELLERS ===== */}
      <section id="sellers" className="border-t border-white/5 bg-navy-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-amber-300">
              <Plane size={14} /> For sellers
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your next trip, already paid for.
            </h2>
            <p className="mt-4 max-w-md text-zinc-400">
              Traveling soon? List your itinerary, accept item requests, and earn on every pickup. You set your own markup.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                "Post a trip in under a minute",
                "Accept requests and set your own markup",
                "Get paid in-app after delivery",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-400">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                    <ArrowRight size={11} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
            >
              Become a justitiper <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-navy-900 p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Plane size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Earn while you fly</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-950/60 px-4 py-3">
                <span className="text-sm text-zinc-400">Your markup</span>
                <span className="text-sm font-bold text-gold-400">You set it</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-950/60 px-4 py-3">
                <span className="text-sm text-zinc-400">Payout</span>
                <span className="text-sm font-bold text-zinc-100">In-app, per order</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-950/60 px-4 py-3">
                <span className="text-sm text-zinc-400">Reviews</span>
                <span className="flex items-center gap-1 text-sm font-bold text-amber-400">
                  <Star size={13} className="fill-current" /> 4.9 average
                </span>
              </div>
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-gold-400" />
              Every justitiper is verified with a real profile. Payments are held in-app until delivery, so both sides stay protected.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gold-400/15 via-zinc-900 to-zinc-900 p-10 text-center md:p-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold-400/20 blur-[100px]" />
            <h2 className="relative mx-auto max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to justitip?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-zinc-400">
              {isAuthenticated ? "Browse live trips and make your first request." : "Create a free account in under a minute."}
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href={isAuthenticated ? "/explore" : "/register"} className="btn-primary !px-8 !py-4 text-base">
                {isAuthenticated ? "Browse trips" : "Get started"} <ArrowRight size={18} />
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-bold text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/5">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
              <Plane size={15} />
            </div>
            <span className="text-sm font-extrabold tracking-tight">
              Justitip<span className="text-gold-400">.</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Travelers shop. Justitipers deliver.
          </p>
        </div>
      </footer>
    </div>
  );
}
