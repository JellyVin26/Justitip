"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Plane, Mail, Lock, User, Phone, ArrowRight, ShoppingBag } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/register", { name, email, password, role, phoneNumber });
      login(res.data.token, res.data.user);
      const userRole = res.data.user?.role || role;
      router.push(userRole === "SELLER" ? "/seller/dashboard" : "/explore");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-zinc-100">
      {/* Left: brand panel */}
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
              Join the network that brings things home.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
              Shop from abroad, or earn on your next trip. One account, both sides of the justitip.
            </p>
          </div>

          <p className="text-xs text-zinc-500">Travelers shop. Justitipers deliver.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400 text-navy-950">
              <Plane size={20} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Justitip<span className="text-gold-400">.</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-gold-400 hover:text-gold-300">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Role toggle */}
            <div>
              <label className="label-base">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    role === "BUYER"
                      ? "border-gold-400 bg-gold-400/10 text-gold-300"
                      : "border-zinc-700 bg-navy-900 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <ShoppingBag size={17} /> Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    role === "SELLER"
                      ? "border-amber-500 bg-amber-500/10 text-amber-300"
                      : "border-zinc-700 bg-navy-900 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <Plane size={17} /> Seller
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {role === "BUYER"
                  ? "You'll request items from travelers and track orders."
                  : "You'll post trips, accept requests, and earn markup."}
              </p>
            </div>

            <div>
              <label htmlFor="name" className="label-base">
                Full name
              </label>
              <div className="relative">
                <User size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-base !pl-11 !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="label-base">
                Email
              </label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="label-base">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input-base !pl-11 !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="label-base">
                Phone number <span className="normal-case text-zinc-500">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="input-base !pl-11 !bg-navy-900 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
              {loading ? "Creating account..." : "Create account"} {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500">
            By creating an account you agree to the Justitip terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
