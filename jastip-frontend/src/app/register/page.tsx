"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, LockKeyhole, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data;
      login(token, user);
      
      if (user.role === 'SELLER') {
        router.push('/seller/dashboard');
      } else {
        router.push('/explore');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white fixed inset-0 z-[100]">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000" 
          alt="Airplane wing over clouds" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center">
            <Truck className="text-white w-5 h-5" />
          </div>
          <span className="text-brand-navy font-bold text-2xl tracking-tight bg-white/80 px-2 rounded-md">Justitip</span>
        </div>

        <div className="absolute bottom-16 left-12 right-12 z-20 text-white max-w-xl">
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            Join the global community.
          </h1>
          <p className="text-lg font-medium opacity-90 leading-relaxed">
            Whether you want to shop the world or earn while traveling, Justitip connects you with verified neighbors globally.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative px-8 sm:px-16 md:px-24">
        <div className="w-full max-w-md">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-navy mb-3">Create an account</h2>
            <p className="text-gray-500 text-sm">Join Justitip to start shopping or earning today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                type="button"
                onClick={() => setRole('BUYER')}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  role === 'BUYER' 
                    ? 'border-brand-navy bg-brand-navy text-white shadow-md' 
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                I want to Buy
              </button>
              <button 
                type="button"
                onClick={() => setRole('SELLER')}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  role === 'SELLER' 
                    ? 'border-brand-navy bg-brand-navy text-white shadow-md' 
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                I want to Sell
              </button>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-600">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all placeholder:text-gray-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-600">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all placeholder:text-gray-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-600">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-navy text-white flex items-center justify-center gap-3 py-3.5 rounded-lg text-sm font-bold tracking-widest hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-brand-navy hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 256-BIT SSL
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-4 h-4" /> SECURE LOGIN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
