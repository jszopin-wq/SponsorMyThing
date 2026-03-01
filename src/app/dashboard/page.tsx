import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Megaphone, Search, Mail, ArrowRight, Plus, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("profiles")
        .select("org_name")
        .eq("id", user?.id ?? "")
        .single();

    const { count: campaignCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "");

    const { count: prospectCount } = await supabase
        .from("prospects")
        .select("*, campaigns!inner(user_id)", { count: "exact", head: true })
        .eq("campaigns.user_id", user?.id ?? "");

    const { count: emailCount } = await supabase
        .from("outreach_emails")
        .select("*, campaigns!inner(user_id)", { count: "exact", head: true })
        .eq("campaigns.user_id", user?.id ?? "");

    const orgName = profile?.org_name || "Your Organization";

    const quickActions = [
        {
            href: "/dashboard/campaigns/new",
            icon: Plus,
            title: "New Campaign",
            description: "Start a new sponsorship or donation campaign",
            color: "from-brand-500 to-purple-500",
        },
        {
            href: "/dashboard/campaigns",
            icon: Search,
            title: "Find Prospects",
            description: "Search for local businesses near you",
            color: "from-blue-500 to-cyan-400",
        },
        {
            href: "/dashboard/outreach",
            icon: Mail,
            title: "View Outreach",
            description: "Review and send generated emails",
            color: "from-pink-500 to-rose-400",
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">
                    Welcome back, <span className="gradient-text">{orgName}</span>
                </h1>
                <p className="mt-1 text-surface-400">
                    Here&apos;s what&apos;s happening with your sponsorship outreach.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
                            <Megaphone className="h-5 w-5 text-brand-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-surface-100">{campaignCount ?? 0}</p>
                            <p className="text-xs text-surface-500">Active Campaigns</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                            <Users className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-surface-100">{prospectCount ?? 0}</p>
                            <p className="text-xs text-surface-500">Prospects Found</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15">
                            <TrendingUp className="h-5 w-5 text-pink-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-surface-100">{emailCount ?? 0}</p>
                            <p className="text-xs text-surface-500">Emails Generated</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-surface-200">Quick Actions</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className="glass-card glass-card-hover p-6 group">
                        <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                            <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="mb-1 font-semibold text-surface-100 group-hover:text-brand-300 transition-colors">
                            {action.title}
                        </h3>
                        <p className="text-sm text-surface-400">{action.description}</p>
                        <ArrowRight className="mt-3 h-4 w-4 text-surface-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
