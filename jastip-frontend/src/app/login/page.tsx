"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SELLER') {
        router.push('/seller/dashboard');
      } else {
        router.push('/explore');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      login(token, user);
      
      // Redirect based on role
      if (user.role === 'SELLER') {
        router.push('/seller/dashboard');
      } else {
        router.push('/explore');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white fixed inset-0 z-[100]">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-black/10 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1549463273-0402b115bc5c?q=80&w=2000" 
          alt="Traveler with luggage in Galleria" 
          className="w-full h-full object-cover"
        />
        
        {/* Top Logo */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center">
            <Truck className="text-white w-5 h-5" />
          </div>
          <span className="text-brand-navy font-bold text-2xl tracking-tight bg-white/80 px-2 rounded-md">Justitip</span>
        </div>

        {/* Bottom Text Overlay */}
        <div className="absolute bottom-16 left-12 right-12 z-20 text-brand-navy max-w-xl">
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            The world, delivered by neighbors.
          </h1>
          <p className="text-lg font-medium opacity-90 leading-relaxed">
            Access the premium global marketplace where trust and efficiency meet. Secure your next delivery with Justitip.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative px-8 sm:px-16 md:px-24">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-navy mb-3">Welcome back</h2>
            <p className="text-gray-500 text-sm">Please enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-600">Password</label>
                <Link href="#" className="text-[11px] font-bold text-brand-navy hover:underline">Forgot password?</Link>
              </div>
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

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy cursor-pointer"
              />
              <label htmlFor="remember" className="ml-3 block text-sm text-gray-600 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-navy text-white flex items-center justify-center gap-3 py-3.5 rounded-lg text-sm font-bold tracking-widest hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05 1.8-3.08 1.8-1.09 0-1.46-.66-2.65-.66-1.18 0-1.6.63-2.62.63-1.08 0-2.26-.95-3.35-2.52C2.9 16.03 2.15 11.55 3.9 8.52c.86-1.5 2.4-2.45 4.08-2.45 1.13 0 2.18.77 2.87.77.68 0 1.88-.9 3.23-.9 1.43 0 2.65.65 3.34 1.63-2.92 1.76-2.43 5.96.48 7.15-.68 1.7-1.85 3.8-2.93 4.88l1.08.68zm-3.66-12.7c.65-.8 1.1-1.92.98-3.03-1.03.04-2.22.68-2.9 1.5-.6.73-1.12 1.88-.97 2.97 1.07.08 2.22-.62 2.89-1.44z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-brand-navy hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-8 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 256-BIT SSL
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-4 h-4" /> SECURE LOGIN
            </div>
          </div>
        </div>

        {/* Absolute Footer */}
        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider font-semibold hidden sm:flex">
          <p>© {new Date().getFullYear()} Justitip Inc.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-600">Privacy</Link>
            <Link href="#" className="hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
