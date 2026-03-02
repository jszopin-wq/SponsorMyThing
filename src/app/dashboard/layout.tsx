"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Heart,
    LayoutDashboard,
    Megaphone,
    Search,
    Mail,
    Settings,
    LogOut,
    Menu,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/dashboard/prospects", label: "Prospects", icon: Search },
    { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface-950">
            {/* ── Top Navigation Bar ──────────────────────────── */}
            <header className="sticky top-0 z-50 w-full border-b border-surface-800/50 bg-surface-950/95 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-orange-500">
                                <Heart className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-surface-100 hidden sm:block">
                                Sponsor<span className="gradient-text">MyThing</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                        isActive(item.href)
                                            ? "bg-brand-600/15 text-brand-300"
                                            : "text-surface-400 hover:bg-surface-800/60 hover:text-surface-200"
                                    )}
                                >
                                    <item.icon className={clsx("h-4 w-4 shrink-0", isActive(item.href) && "text-brand-400")} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Logout */}
                        <button
                            onClick={handleLogout}
                            className="hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Log Out</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {mobileOpen && (
                    <div className="border-t border-surface-800/50 bg-surface-950/95 lg:hidden px-4 py-4 space-y-4">
                        <nav className="flex flex-col space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive(item.href)
                                            ? "bg-brand-600/15 text-brand-300"
                                            : "text-surface-400 hover:bg-surface-800/60 hover:text-surface-200"
                                    )}
                                >
                                    <item.icon className={clsx("h-5 w-5 shrink-0", isActive(item.href) && "text-brand-400")} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="border-t border-surface-800/50 pt-4">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="h-5 w-5 shrink-0" />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Main Content ───────────────────────────────── */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
