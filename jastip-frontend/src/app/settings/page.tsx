"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
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
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');
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
        setPreferredCurrency(data.preferredCurrency || 'USD');
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
        preferredCurrency,
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        {/* Header navigation */}
        <div className="mb-8">
          <Link 
            href={user?.role === 'SELLER' ? '/seller/dashboard' : '/explore'} 
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          {/* Top Banner Accent */}
          <div className="h-32 bg-gradient-to-r from-emerald-500/20 to-zinc-800" />
          
          <div className="px-8 pb-10">
            {/* Avatar section */}
            <div className="relative -mt-16 mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-end">
              <div className="relative group w-32 h-32 overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center transition-all">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-emerald-300">{name.charAt(0) || 'U'}</span>
                )}
                
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

              <div className="pb-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-zinc-100">{name || 'Your Name'}</h2>
                <p className="text-sm font-medium text-zinc-500">{user?.role} Account • {user?.email}</p>
              </div>
            </div>

            {/* Notifications */}
            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
                <Check className="w-5 h-5" /> {success}
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <h3 className="mb-4 border-b border-white/5 pb-2 text-lg font-bold text-zinc-100">Personal Information</h3>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="label-base">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <User className="h-5 w-5 text-zinc-600" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="input-base !pl-11 !bg-zinc-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="label-base">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Phone className="h-5 w-5 text-zinc-600" />
                      </div>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+62 812-3456-7890"
                        className="input-base !pl-11 !bg-zinc-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 border-b border-white/5 pb-2 text-lg font-bold text-zinc-100">Location Settings</h3>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Country */}
                  <div className="space-y-2">
                    <label className="label-base">Based in Nation (Country)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Globe className="h-5 w-5 text-zinc-600" />
                      </div>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Indonesia"
                        className="input-base !pl-11 !bg-zinc-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="label-base">Based in City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <MapPin className="h-5 w-5 text-zinc-600" />
                      </div>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Jakarta"
                        className="input-base !pl-11 !bg-zinc-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="label-base">Biography / Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-zinc-600" />
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other travelers or buyers about yourself..."
                    className="input-base !pl-11 !bg-zinc-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500 resize-none"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="mb-4 border-b border-white/5 pb-2 text-lg font-bold text-zinc-100">Preferences</h3>
                <div className="space-y-2">
                  <label className="label-base">Preferred Currency</label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="input-base !bg-zinc-950 !border-zinc-700 !text-zinc-100"
                    disabled={saving}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="KRW">KRW - South Korean Won</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="THB">THB - Thai Baht</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 border-t border-white/5 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="btn-primary disabled:opacity-75"
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
