"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-brand-600/15 blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/3 h-72 w-72 rounded-full bg-purple-600/10 blur-[128px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-surface-100">
                            Sponsor<span className="gradient-text">MyThing</span>
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <h1 className="mb-1 text-2xl font-bold text-surface-100">Welcome back</h1>
                    <p className="mb-6 text-sm text-surface-400">Sign in to your account to continue</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-surface-300">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="you@organization.org"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-surface-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-surface-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
}
