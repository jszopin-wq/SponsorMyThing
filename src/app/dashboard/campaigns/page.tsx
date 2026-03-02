"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Megaphone, ArrowRight, Trash2, CheckSquare, Square } from "lucide-react";
import { bulkDeleteCampaigns } from "@/app/dashboard/campaigns/actions";

interface Campaign {
    id: string;
    name: string;
    description: string;
    status: string;
    prospects: Array<{ count: number }>;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        async function loadCampaigns() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const { data } = await supabase
                .from("campaigns")
                .select("*, prospects(count)")
                .eq("user_id", user?.id ?? "")
                .order("created_at", { ascending: false });

            setCampaigns(data || []);
            setIsLoading(false);
        }
        loadCampaigns();
    }, []);

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDelete = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} campaigns?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await bulkDeleteCampaigns(Array.from(selectedIds));
                setCampaigns(campaigns.filter(c => !selectedIds.has(c.id)));
                setSelectedIds(new Set());
            } catch (error) {
                console.error("Bulk delete failed", error);
                alert("Failed to delete selected campaigns.");
            }
        });
    };

    if (isLoading) return <div className="animate-pulse p-12 text-center text-surface-400">Loading campaigns...</div>;

    return (
        <div className="animate-fade-in">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-surface-100">Campaigns</h1>
                    <p className="mt-1 text-surface-400">Manage your sponsorship and donation campaigns.</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="btn-secondary border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isPending ? "Deleting..." : `Delete (${selectedIds.size})`}
                        </button>
                    )}
                    <Link href="/dashboard/campaigns/new" className="btn-primary">
                        <Plus className="h-4 w-4" /> New Campaign
                    </Link>
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Megaphone className="mx-auto h-12 w-12 text-surface-600 mb-4" />
                    <h3 className="text-lg font-semibold text-surface-300">No campaigns yet</h3>
                    <p className="mt-1 text-sm text-surface-500 mb-6">Create your first campaign to start finding sponsors.</p>
                    <Link href="/dashboard/campaigns/new" className="btn-primary">
                        <Plus className="h-4 w-4" /> Create Campaign
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign, i) => {
                        const isSelected = selectedIds.has(campaign.id);

                        return (
                            <div key={campaign.id} className="relative group animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${i * 50}ms` }}>
                                {/* Checkbox / Clickable Box overlay */}
                                <button
                                    onClick={(e) => toggleSelection(campaign.id, e)}
                                    className={`absolute top-4 right-4 z-10 p-1.5 border rounded transition-colors ${isSelected
                                        ? "border-red-400 bg-red-400/20 text-red-400"
                                        : "border-surface-600 bg-surface-800/80 text-surface-400 hover:border-surface-400 hover:text-surface-200"
                                        }`}
                                    aria-label="Select campaign for deletion"
                                >
                                    {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                </button>

                                <Link
                                    href={`/dashboard/campaigns/${campaign.id}`}
                                    className={`glass-card glass-card-hover p-6 block h-full transition-all ${isSelected ? 'ring-2 ring-red-500/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-3 pr-10">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
                                            <Megaphone className="h-5 w-5 text-brand-400" />
                                        </div>
                                        <span className={`badge ${campaign.status === "active" ? "badge-active" : "badge-draft"}`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-surface-100 group-hover:text-brand-300 transition-colors">
                                        {campaign.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-surface-400 line-clamp-2">{campaign.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-surface-500">
                                            {(campaign.prospects as unknown as Array<{ count: number }>)?.[0]?.count || 0} prospects
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-surface-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
