"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Globe, Calendar, ShieldCheck, Star, UserPlus, UserCheck, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingAction, setFollowingAction] = useState(false);

  const sellerId = params.id as string;

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [profileRes, followingRes] = await Promise.all([
          api.get(`/users/${sellerId}`),
          isAuthenticated ? api.get("/users/me/following").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);

        setSeller(profileRes.data);
        if (isAuthenticated) {
          setIsFollowing(followingRes.data.includes(sellerId));
        }
      } catch (err) {
        console.error("Failed to load seller profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) fetchSellerData();
  }, [sellerId, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert("Please log in to follow sellers.");
      router.push("/login");
      return;
    }

    try {
      setFollowingAction(true);
      if (isFollowing) {
        await api.delete(`/users/${sellerId}/follow`);
        setSeller((prev: any) => ({
          ...prev,
          _count: { ...prev._count, followers: Math.max(0, prev._count.followers - 1) },
        }));
      } else {
        await api.post(`/users/${sellerId}/follow`);
        setSeller((prev: any) => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers + 1 },
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Failed to toggle follow", error);
      alert("Failed to update follow status.");
    } finally {
      setFollowingAction(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
      </div>
    );
  if (!seller)
    return <div className="min-h-screen bg-zinc-950 py-20 text-center font-medium text-zinc-400">Seller not found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          {/* Banner */}
          <div className="relative h-40 w-full bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15),transparent_60%)]" />
          </div>

          <div className="px-6 pb-10 sm:px-8">
            {/* Avatar + action */}
            <div className="mb-6 flex items-end justify-between -mt-16">
              <div className="relative h-32 w-32 rounded-full bg-zinc-900 p-2 shadow-lg">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-emerald-500/15 text-4xl font-black text-emerald-300">
                  {seller.avatarUrl ? (
                    <img src={seller.avatarUrl} alt={seller.name} className="h-full w-full object-cover" />
                  ) : (
                    seller.name?.charAt(0).toUpperCase() || "S"
                  )}
                </div>
              </div>

              {user?.id !== sellerId && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followingAction}
                  className={
                    isFollowing
                      ? "btn-ghost !border-zinc-700 !bg-zinc-900 !text-zinc-300 hover:!bg-zinc-800"
                      : "btn-primary"
                  }
                >
                  {followingAction ? "Wait..." : isFollowing ? (
                    <><UserCheck size={16} /> Following</>
                  ) : (
                    <><UserPlus size={16} /> Follow seller</>
                  )}
                </button>
              )}
            </div>

            {/* Info */}
            <div className="mb-10">
              <h1 className="mb-2 text-3xl font-black text-zinc-100">{seller.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-400">
                {seller.country && (
                  <span className="flex items-center gap-1.5">
                    <Globe size={15} className="text-zinc-600" /> {seller.city ? `${seller.city}, ` : ""}{seller.country}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-zinc-600" /> Joined {new Date(seller.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </span>
                {seller.role === "SELLER" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-amber-300">
                    <Star size={13} className="fill-current" /> Verified courier
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mb-10 grid grid-cols-3 gap-6 border-y border-white/5 py-8">
              <div className="text-center">
                <div className="mb-1 text-2xl font-black text-zinc-100">{seller._count?.followers || 0}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Followers</div>
              </div>
              <div className="border-x border-white/5 text-center">
                <div className="mb-1 text-2xl font-black text-zinc-100">{seller._count?.following || 0}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Following</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-black text-zinc-100">{seller._count?.trips || 0}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Trips hosted</div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-100">About me</h3>
              <p className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 leading-relaxed text-zinc-400">
                {seller.bio || "This user hasn't written a biography yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
