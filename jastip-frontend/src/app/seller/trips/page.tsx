"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Plane, Plus, MapPin, ArrowRight, Calendar } from "lucide-react";
import PostTripModal from "@/components/PostTripModal";

export default function SellerTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostTripModalOpen, setIsPostTripModalOpen] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips?sellerId=${user?.id}`);
      setTrips(res.data);
    } catch (error) {
      console.error("Failed to fetch trips", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My trips</h1>
            <p className="mt-1 text-sm text-zinc-400">Upcoming and past trips you're offering to buyers.</p>
          </div>
          <button onClick={() => setIsPostTripModalOpen(true)} className="btn-primary">
            <Plus size={16} /> New trip
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gold-400"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-navy-900 p-12 text-center">
            <Plane size={48} className="mb-4 text-zinc-700" />
            <h2 className="text-xl font-bold text-zinc-200">No trips posted yet</h2>
            <p className="mt-1 max-w-md text-zinc-500">
              Post your upcoming travel so buyers can request items from your destination.
            </p>
            <button onClick={() => setIsPostTripModalOpen(true)} className="btn-primary mt-6">
              <Plus size={16} /> Post your first trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/seller/trips/${trip.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 transition-all hover:border-gold-400/40"
              >
                <div className="relative h-32 bg-gradient-to-br from-navy-700 to-navy-900">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,163,61,0.15),transparent_60%)]" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-lg font-extrabold tracking-tight text-gold-300">{trip.destinationCountry}</h3>
                    <p className="flex items-center gap-1 font-mono text-xs text-zinc-400">
                      <Calendar size={11} />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-400">{trip.status}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-gold-400 transition-transform group-hover:translate-x-0.5">
                    Manage <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <PostTripModal
          isOpen={isPostTripModalOpen}
          onClose={() => setIsPostTripModalOpen(false)}
          onSuccess={() => {
            setIsPostTripModalOpen(false);
            fetchTrips();
          }}
        />
      </div>
    </div>
  );
}
