"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { User, Phone, MapPin, Globe, FileText, Camera, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // UI states
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`/users/${user.id}`);
        const data = response.data;
        setName(data.name || '');
        setPhoneNumber(data.phoneNumber || '');
        setCountry(data.country || '');
        setCity(data.city || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatarUrl || '');
      } catch (err: any) {
        console.error('Failed to load profile details:', err);
        setError('Failed to load profile details. Showing offline data.');
        // Fallback to basic session storage details
        setName(user.name || '');
        setPhoneNumber((user as any).phoneNumber || '');
        setAvatarUrl((user as any).avatarUrl || '');
      } finally {
        setFetching(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(response.data.url);
      setSuccess('Image uploaded successfully! Remember to save changes.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload image. Please verify your Supabase configuration.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/users/${user.id}`, {
        name,
        phoneNumber,
        avatarUrl,
        country,
        city,
        bio,
      });

      // Update local auth context
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-28 pb-16 px-4">
        {/* Header navigation */}
        <div className="mb-8">
          <Link 
            href={user?.role === 'SELLER' ? '/seller/dashboard' : '/explore'} 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top Banner Accent */}
          <div className="h-32 bg-gradient-to-r from-brand-navy to-gray-800" />
          
          <div className="px-8 pb-10">
            {/* Avatar section */}
            <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <div className="relative group w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-brand-navy">{name.charAt(0) || 'U'}</span>
                )}
                
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-6 h-6 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    disabled={uploading || saving}
                  />
                </label>
              </div>

              <div className="text-center sm:text-left pb-2">
                <h2 className="text-2xl font-bold text-brand-navy">{name || 'Your Name'}</h2>
                <p className="text-gray-500 text-sm font-medium">{user?.role} Account • {user?.email}</p>
              </div>
            </div>

            {/* Notifications */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Check className="w-5 h-5" /> {success}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-brand-navy mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all font-medium"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+62 812-3456-7890"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all font-medium"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-brand-navy mb-4 border-b border-gray-100 pb-2">Location Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500">Based in Nation (Country)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Indonesia"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all font-medium"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500">Based in City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Jakarta"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all font-medium"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500">Biography / Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other travelers or buyers about yourself..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all font-medium resize-none"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 gap-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-brand-navy text-white px-8 py-3.5 rounded-xl text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {saving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
