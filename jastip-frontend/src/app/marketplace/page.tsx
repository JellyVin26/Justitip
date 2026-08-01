"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Package, ShieldCheck, Star, ArrowRight, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

const CATEGORIES = ["All Items", "Trending", "Electronics", "Beauty", "Fashion", "Snacks & Food", "Toys & Collectibles", "Other"];

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [sortOption, setSortOption] = useState("Newest First");
  const [followedSellers, setFollowedSellers] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const fetchListings = async (search = searchQuery, cat = selectedCategory, following = followingOnly) => {
    try {
      setLoading(true);
      let endpoint = "/listings?";

      if (following && isAuthenticated && user) {
        endpoint += `followingOnly=true&followerId=${user.id}&`;
      }
      if (cat && cat !== "All Items") {
        endpoint += `category=${encodeURIComponent(cat)}&`;
      }
      if (search) {
        endpoint += `search=${encodeURIComponent(search)}&`;
      }
      if (user?.preferredCurrency) {
        endpoint += `currency=${encodeURIComponent(user.preferredCurrency)}&`;
      }
      endpoint = endpoint.replace(/[?&]$/, "");

      const response = await api.get(endpoint);
      let fetchedListings = response.data;
      if (sortOption === "Lowest Price") {
        fetchedListings = fetchedListings.sort((a: any, b: any) => a.price - b.price);
      } else if (sortOption === "Highest Price") {
        fetchedListings = fetchedListings.sort((a: any, b: any) => b.price - a.price);
      } else {
        fetchedListings = fetchedListings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setListings(fetchedListings);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    if (isAuthenticated && user) {
      api.get("/users/me/following")
        .then((res) => setFollowedSellers(new Set(res.data)))
        .catch((err) => console.error("Failed to fetch following", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followingOnly, selectedCategory, isAuthenticated, user]);

  const handleOrder = async (listing: any) => {
    if (!isAuthenticated || !user) {
      alert("Please log in to place an order.");
      router.push("/login");
      return;
    }
    try {
      const res = await api.post("/orders", {
        tripId: listing.tripId,
        buyerId: user.id,
        listingId: listing.id,
        productName: listing.productName,
        estimatedPrice: listing.price,
        localCurrency: listing.localCurrency,
        quantity: 1,
        category: listing.category,
      });
      router.push(`/orders/${res.data.id}`);
    } catch (error: any) {
      console.error("Failed to order item", error);
      alert(`Failed to place order: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleToggleFollow = async (sellerId: string) => {
    if (!isAuthenticated || !user) {
      alert("Please log in to follow sellers.");
      router.push("/login");
      return;
    }
    const isFollowing = followedSellers.has(sellerId);

    // Optimistic update
    setFollowedSellers((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(sellerId);
      else next.add(sellerId);
      return next;
    });

    try {
      if (isFollowing) {
        await api.delete(`/users/${sellerId}/follow`);
      } else {
        await api.post(`/users/${sellerId}/follow`);
      }
    } catch (error) {
      console.error("Failed to update follow", error);
      setFollowedSellers((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(sellerId);
        else next.delete(sellerId);
        return next;
      });
      alert("Failed to update follow status.");
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Available <span className="text-gold-400">items.</span>
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Pre-listed items from verified justitipers. Order directly and get it delivered on their next trip.
          </p>

          {/* Search + Following toggle */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchListings(searchQuery, selectedCategory, followingOnly);
                }}
                placeholder="Search by product name, brand, or country..."
                className="input-base !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500 !pl-11"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-navy-900 p-1.5">
              <button
                onClick={() => setFollowingOnly(false)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${!followingOnly ? "bg-gold-400 text-navy-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                All Items
              </button>
              <button
                onClick={() => setFollowingOnly(true)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${followingOnly ? "bg-gold-400 text-navy-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                Following
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {CATEGORIES.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedCategory(tag)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === tag
                    ? "bg-gold-400 text-navy-950"
                    : "border border-zinc-700 bg-navy-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Results header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-500">Showing {listings.length} available items</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="cursor-pointer rounded-lg border border-zinc-700 bg-navy-900 px-3 py-1.5 text-sm font-bold text-zinc-100 outline-none"
            >
              <option>Newest First</option>
              <option>Lowest Price</option>
              <option>Highest Price</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900">
                <div className="h-48 animate-pulse bg-navy-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-navy-800" />
                  <div className="h-7 w-1/3 animate-pulse rounded bg-navy-800" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-navy-800" />
                </div>
              </div>
            ))}
          </section>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-navy-900 py-20 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="text-lg font-bold text-zinc-200">No items found</h3>
            <p className="mt-1 text-zinc-500">Check back later or adjust your filters.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div key={listing.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 transition-colors hover:border-white/20">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-navy-800">
                  <img
                    src={listing.imageUrl || "https://picsum.photos/seed/justitip-item/600/400"}
                    alt={listing.productName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-navy-950/80 px-3 py-1.5 text-xs font-bold text-zinc-100 backdrop-blur-sm">
                    <MapPin size={12} className="text-gold-400" /> {listing.trip?.destinationCountry || "Unknown"}
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-bold leading-tight text-zinc-100">{listing.productName}</h3>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-gold-400">
                    {formatCurrency(listing.price, listing.localCurrency)}
                  </p>

                  {/* Seller */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="relative cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/seller/${listing.sellerId}`);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/15 text-xs font-bold text-gold-300">
                          {listing.seller?.name?.charAt(0) || "S"}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-navy-900 p-0.5">
                          <ShieldCheck size={12} className="text-gold-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p
                            className="cursor-pointer text-xs font-bold text-zinc-200 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/seller/${listing.sellerId}`);
                            }}
                          >
                            {listing.seller?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-bold text-zinc-300">
                            {listing.seller?.averageRating > 0 ? listing.seller.averageRating.toFixed(1) : "New"}
                          </span>
                          {listing.seller?.reviewCount > 0 && (
                            <span className="text-[11px] text-zinc-500">({listing.seller.reviewCount})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Follow / unfollow */}
                    <div className="text-right">
                      {followedSellers.has(listing.sellerId) ? (
                        <button
                          onClick={() => handleToggleFollow(listing.sellerId)}
                          className="flex items-center gap-1 text-[11px] font-bold text-gold-400 hover:text-gold-300"
                        >
                          <UserCheck size={12} /> Following
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleFollow(listing.sellerId)}
                          className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-zinc-200"
                        >
                          <UserPlus size={12} /> Follow
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleOrder(listing)}
                    className="btn-primary mt-4 w-full"
                  >
                    Order now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Custom request CTA */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-gold-400/20 bg-gradient-to-br from-gold-400/10 via-zinc-900 to-zinc-900 p-8 md:flex-row">
          <div>
            <h3 className="text-xl font-bold text-zinc-100">Can't find what you're looking for?</h3>
            <p className="mt-1 max-w-lg text-sm text-zinc-400">
              Submit a custom request to a seller going to your destination. Browse active trips and ask for anything.
            </p>
          </div>
          <button
            onClick={() => router.push("/trips")}
            className="btn-primary whitespace-nowrap"
          >
            Browse trips <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
