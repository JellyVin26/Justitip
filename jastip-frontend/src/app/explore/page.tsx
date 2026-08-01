"use client";
import React, { useState, useEffect } from "react";
import { Search, Calendar, Star, ShieldCheck, MapPin, ArrowRight, Plane } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Departure Date");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const fetchTrips = async (search = searchQuery, following = followingOnly) => {
    try {
      setLoading(true);
      let endpoint = "/trips";
      const params: string[] = [];

      if (search) params.push(`country=${encodeURIComponent(search)}`);
      if (following && isAuthenticated && user) {
        params.push(`followingOnly=true&followerId=${user.id}`);
      }
      if (params.length > 0) endpoint += `?${params.join("&")}`;

      const response = await api.get(endpoint);
      let data = response.data;

      if (sortOption === "Highest Rating") {
        data = [...data].sort(
          (a: any, b: any) => (b.seller?.averageRating || 0) - (a.seller?.averageRating || 0)
        );
      } else if (sortOption === "Most Capacity") {
        data = [...data].sort(
          (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      } else {
        // Departure Date
        data = [...data].sort(
          (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      }

      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followingOnly]);

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,185,66,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(49,64,107,0.35),transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Travelers bring it.
                <br />
                <span className="text-gold-400">You save.</span>
              </h1>
              <p className="mt-3 max-w-xl text-base text-zinc-400">
                Browse scheduled trips by verified justitipers. Request items from their destination and get them delivered to your doorstep.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => document.getElementById("trip-grid")?.scrollIntoView({ behavior: "smooth" })} className="btn-primary">
                  Browse trips
                </button>
              </div>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
                {[
                  { k: "Verified", v: "justitipers" },
                  { k: "Global", v: "destinations" },
                  { k: "Protected", v: "payments" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border border-white/10 bg-navy-900/60 p-3 text-center">
                    <p className="text-sm font-extrabold text-gold-300">{s.k}</p>
                    <p className="text-[11px] font-medium text-zinc-500">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-navy-800 to-navy-950 p-8">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,rgba(245,185,66,0.12),transparent_60%)]" />
                <Plane size={40} className="mb-6 text-gold-400" />
                <p className="text-2xl font-extrabold leading-snug text-zinc-100">
                  "Got my Tokyo sneakers in a week."
                </p>
                <p className="mt-2 text-sm text-zinc-500">- Dina, Jakarta</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-navy-950/60 p-3">
                    <p className="text-lg font-extrabold text-gold-400">24h</p>
                    <p className="text-[11px] text-zinc-500">avg. response</p>
                  </div>
                  <div className="rounded-xl bg-navy-950/60 p-3">
                    <p className="text-lg font-extrabold text-gold-400">4.9</p>
                    <p className="text-[11px] text-zinc-500">justitiper rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Available <span className="text-gold-400">trips.</span>
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Browse scheduled trips by verified justitipers. Request items from their destination and get them delivered to your doorstep.
          </p>

          {/* Search + toggle */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchTrips(searchQuery, followingOnly);
                }}
                placeholder="Search by destination city or country..."
                className="input-base !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500 !pl-11"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-navy-900 p-1.5">
              <button
                onClick={() => setFollowingOnly(false)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${!followingOnly ? "bg-gold-400 text-navy-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                All Trips
              </button>
              <button
                onClick={() => setFollowingOnly(true)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${followingOnly ? "bg-gold-400 text-navy-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                Following
              </button>
            </div>
          </div>
        </section>

        {/* Results header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-500">Showing {trips.length} active trips</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setTimeout(() => fetchTrips(searchQuery, followingOnly), 0);
              }}
              className="cursor-pointer rounded-lg border border-zinc-700 bg-navy-900 px-3 py-1.5 text-sm font-bold text-zinc-100 outline-none"
            >
              <option>Departure Date</option>
              <option>Highest Rating</option>
              <option>Most Capacity</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <section id="trip-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900">
                <div className="h-48 animate-pulse bg-navy-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-navy-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-navy-800" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-navy-800" />
                </div>
              </div>
            ))}
          </section>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-navy-900 py-20 text-center">
            <Plane className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="text-lg font-bold text-zinc-200">No trips found</h3>
            <p className="mt-1 text-zinc-500">Check back later or adjust your filters.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                href={`/trips/${trip.id}`}
                key={trip.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 transition-colors hover:border-white/20"
              >
                {/* Destination image */}
                <div className="relative h-48 overflow-hidden bg-navy-800">
                  <img
                    src={trip.image || "https://picsum.photos/seed/justitip-trip/600/400"}
                    alt={trip.destinationCountry}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="flex items-center gap-1.5 text-xl font-bold text-white">
                      <MapPin size={16} className="text-gold-400" /> {trip.destinationCountry}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                      <Calendar size={12} />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/seller/${trip.sellerId}`);
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15 text-sm font-bold text-gold-300">
                        {trip.seller?.name?.charAt(0) || "S"}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-navy-900 p-0.5">
                        <ShieldCheck size={12} className="text-gold-400" />
                      </div>
                    </div>
                    <div>
                      <p
                        className="cursor-pointer text-sm font-bold text-zinc-100 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/seller/${trip.sellerId}`);
                        }}
                      >
                        {trip.seller?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-zinc-300">
                          {trip.seller?.averageRating > 0 ? trip.seller.averageRating.toFixed(1) : "New"}
                        </span>
                        {trip.seller?.reviewCount > 0 && (
                          <span className="text-[11px] text-zinc-500">({trip.seller.reviewCount})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/trips/${trip.id}`);
                    }}
                    className="btn-primary mt-5 w-full"
                  >
                    Request an item <ArrowRight size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
