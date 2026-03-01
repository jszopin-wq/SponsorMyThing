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
 ChevronLeft,
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
 const [collapsed, setCollapsed] = useState(false);
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
 <div className="flex min-h-screen">
 {/* ── Mobile overlay ─────────────────────────────── */}
 {mobileOpen && (
 <div
 className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
 onClick={() => setMobileOpen(false)}
 />
 )}

 {/* ── Sidebar ────────────────────────────────────── */}
 <aside
 className={clsx(
 "fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-surface-800/50 bg-surface-950/95 backdrop-blur-xl transition-all duration-300 lg:relative",
 collapsed ? "w-[72px]" : "w-64",
 mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
 )}
 >
 {/* Logo */}
 <div className="flex h-16 items-center justify-between border-b border-surface-800/50 px-4">
 {!collapsed && (
 <Link href="/dashboard" className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-va-dark ">
 <Heart className="h-4 w-4 text-white" />
 </div>
 <span className="text-sm font-bold text-surface-100">
 Sponsor<span className="gradient-text">MyThing</span>
 </span>
 </Link>
 )}
 {collapsed && (
 <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm bg-va-dark ">
 <Heart className="h-4 w-4 text-white" />
 </div>
 )}
 <button
 onClick={() => setCollapsed(!collapsed)}
 className="hidden rounded-sm p-1.5 text-surface-500 hover:bg-surface-800 hover:text-surface-300 transition-colors lg:block"
 >
 <ChevronLeft className={clsx("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
 </button>
 </div>

 {/* Nav */}
 <nav className="flex-1 space-y-1 p-3">
 {navItems.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileOpen(false)}
 className={clsx(
 "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200",
 isActive(item.href)
 ? "bg-brand-600/15 text-brand-300"
 : "text-surface-400 hover:bg-surface-800/60 hover:text-surface-200"
 )}
 >
 <item.icon className={clsx("h-5 w-5 shrink-0", isActive(item.href) && "text-brand-400")} />
 {!collapsed && <span>{item.label}</span>}
 </Link>
 ))}
 </nav>

 {/* Logout */}
 <div className="border-t border-surface-800/50 p-3">
 <button
 onClick={handleLogout}
 className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
 >
 <LogOut className="h-5 w-5 shrink-0" />
 {!collapsed && <span>Log Out</span>}
 </button>
 </div>
 </aside>

 {/* ── Main Content ───────────────────────────────── */}
 <main className="flex-1 overflow-auto">
 {/* Top bar (mobile) */}
 <div className="sticky top-0 z-30 flex h-14 items-center border-b border-surface-800/50 bg-surface-950/90 backdrop-blur-xl px-4 lg:hidden">
 <button
 onClick={() => setMobileOpen(true)}
 className="rounded-sm p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200"
 >
 <Menu className="h-5 w-5" />
 </button>
 <span className="ml-3 text-sm font-bold text-surface-100">
 Sponsor<span className="gradient-text">MyThing</span>
 </span>
 </div>

 <div className="p-6 lg:p-8">
 {children}
 </div>
 </main>
 </div>
 );
}
