"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Plane, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      const role = res.data.user?.role;
      router.push(role === "SELLER" ? "/seller/dashboard" : "/explore");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-zinc-100">
      {/* Left: brand panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 via-zinc-950 to-zinc-950" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold-400/10 blur-[100px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400 text-navy-950">
              <Plane size={20} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Justitip<span className="text-gold-400">.</span>
            </span>
          </Link>

          <div>
            <h2 className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight">
              Welcome back to the world of justitip.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
              Sign in to track your orders, chat with justitipers, and keep your trips moving.
            </p>
          </div>

          <p className="text-xs text-zinc-500">
            Travelers shop. Justitipers deliver.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400 text-navy-950">
              <Plane size={20} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Justitip<span className="text-gold-400">.</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">
            New to Justitip?{" "}
            <Link href="/register" className="font-bold text-gold-400 hover:text-gold-300">
              Create an account
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="label-base">
                Email
              </label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-base !pl-11 !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-base">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base !pl-11 !pr-12 !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" className="h-4 w-4 rounded border-zinc-700 bg-navy-900 accent-gold-400" />
                Remember me
              </label>
              <button type="button" className="text-sm font-bold text-gold-400 transition-colors hover:text-gold-300">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
              {loading ? "Signing in..." : "Sign in"} {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500">
            Demo accounts: <span className="font-semibold text-zinc-400">buyer@justitip.app</span> /{" "}
            <span className="font-semibold text-zinc-400">seller@justitip.app</span> (password:{" "}
            <span className="font-semibold text-zinc-400">justitip123</span>)
          </p>
        </div>
      </div>
    </div>
  );
}
