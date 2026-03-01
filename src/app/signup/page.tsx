"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [orgName, setOrgName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { org_name: orgName },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Update the profile with org name
        if (data.user) {
            await supabase
                .from("profiles")
                .update({ org_name: orgName })
                .eq("id", data.user.id);
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[128px]" />
                <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-brand-600/10 blur-[128px]" />
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
                    <h1 className="mb-1 text-2xl font-bold text-surface-100">Create your account</h1>
                    <p className="mb-6 text-sm text-surface-400">Start finding sponsors for your cause in minutes</p>

                    {/* Google Sign-Up */}
                    <button
                        type="button"
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signInWithOAuth({
                                provider: "google",
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                },
                            });
                        }}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-surface-700/50 bg-surface-800/50 px-4 py-3 text-sm font-medium text-surface-200 transition-all hover:bg-surface-700/50 hover:border-surface-600"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-surface-700/50" />
                        <span className="text-xs text-surface-500">or sign up with email</span>
                        <div className="h-px flex-1 bg-surface-700/50" />
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <label htmlFor="org-name" className="mb-1.5 block text-sm font-medium text-surface-300">
                                Organization Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="org-name"
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Westside Little League"
                                    required
                                />
                            </div>
                        </div>

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
                                    minLength={6}
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-surface-500">Minimum 6 characters</p>
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
                                    Create Account <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-surface-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
