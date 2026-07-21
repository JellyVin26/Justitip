"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Globe, Calendar, User, Package, Star } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
          isAuthenticated ? api.get('/users/me/following').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ]);
        
        setSeller(profileRes.data);
        if (isAuthenticated) {
          setIsFollowing(followingRes.data.includes(sellerId));
        }
      } catch (err) {
        console.error('Failed to load seller profile', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (sellerId) fetchSellerData();
  }, [sellerId, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert("Please log in to follow sellers.");
      router.push('/login');
      return;
    }
    
    try {
      setFollowingAction(true);
      if (isFollowing) {
        await api.delete(`/users/${sellerId}/follow`);
        setSeller((prev: any) => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers - 1 }
        }));
      } else {
        await api.post(`/users/${sellerId}/follow`);
        setSeller((prev: any) => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers + 1 }
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to toggle follow', error);
      alert('Failed to update follow status.');
    } finally {
      setFollowingAction(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" /></div>;
  if (!seller) return <div className="text-center py-20 text-gray-500 font-medium">Seller not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-40 bg-[#0A192F] relative w-full">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          </div>
          
          {/* Profile Content */}
          <div className="px-8 pb-10">
            {/* Avatar & Action Button */}
            <div className="flex justify-between items-end -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full p-2 relative shadow-lg">
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-4xl font-black overflow-hidden border border-gray-100">
                  {seller.avatarUrl ? (
                    <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
                  ) : (
                    seller.name?.charAt(0).toUpperCase() || 'S'
                  )}
                </div>
              </div>
              
              {user?.id !== sellerId && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followingAction}
                  className={`px-8 py-3 rounded-xl font-bold tracking-wide transition-all shadow-sm ${
                    isFollowing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' 
                      : 'bg-brand-navy text-white hover:bg-brand-navy/90 border border-brand-navy'
                  }`}
                >
                  {followingAction ? 'Wait...' : isFollowing ? 'Following' : 'Follow Seller'}
                </button>
              )}
            </div>

            {/* Seller Info */}
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 mb-2">{seller.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                {seller.country && (
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" /> {seller.city ? `${seller.city}, ` : ''}{seller.country}</span>
                )}
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Joined {new Date(seller.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                {seller.role === 'SELLER' && (
                  <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star className="w-3.5 h-3.5" /> Verified Courier</span>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-10 border-y border-gray-100 py-8">
              <div className="text-center">
                <div className="text-2xl font-black text-brand-navy mb-1">{seller._count?.followers || 0}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-gray-400">Followers</div>
              </div>
              <div className="text-center border-x border-gray-100">
                <div className="text-2xl font-black text-brand-navy mb-1">{seller._count?.following || 0}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-brand-navy mb-1">{seller._count?.trips || 0}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-gray-400">Trips Hosted</div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">About Me</h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                {seller.bio || "This user hasn't written a biography yet."}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
