"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState, useCallback, use } from "react";
import { ArrowLeft, Search, Mail, Globe, Phone, MapPin, Star, ExternalLink, Loader2, Play, Megaphone } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    description: string;
    status: string;
    campaign_type: string;
    goal_amount: number | null;
    user_id: string;
}

interface Prospect {
    id: string;
    name: string;
    category?: string;
    rating?: number;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
    enrichments?: Array<{ summary: string }> | { summary: string };
    outreach_emails?: Array<{ id: string }>;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [prosError, setProsError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        // Load on client to safely handle state updates for buttons
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: campData } = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", id)
            .eq("user_id", user?.id ?? "")
            .single();

        if (campData) setCampaign(campData);

        const { data: prosData, error: prosError } = await supabase
            .from("prospects")
            .select("*, enrichments(*), outreach_emails(*)")
            .eq("campaign_id", id)
            .order("created_at", { ascending: false });

        console.log("PROSPECTS QUERY:", { prosData, prosError, id });

        if (prosError) setProsError(prosError);
        if (prosData) setProspects(prosData);
        setIsLoading(false);
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGenerateEmail = async (prospectId: string) => {
        setGeneratingId(prospectId);
        try {
            const res = await fetch("/api/generate-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prospect_id: prospectId, campaign_id: id }),
            });
            if (res.ok) {
                await loadData(); // Reload UI to show email
            } else {
                alert("Failed to generate email.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setGeneratingId(null);
        }
    };

    const handleBulkGenerate = async (unemailedProspects: Prospect[]) => {
        setIsGeneratingBulk(true);
        for (const prospect of unemailedProspects) {
            setGeneratingId(prospect.id); // Show spinner per row
            try {
                await fetch("/api/generate-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prospect_id: prospect.id, campaign_id: id }),
                });
            } catch (error) {
                console.error(`Failed to generate email for ${prospect.name}`, error);
            }
        }
        await loadData();
        setIsGeneratingBulk(false);
        setGeneratingId(null);
    };

    if (isLoading) return <div className="animate-pulse p-12 text-center text-surface-400">Loading campaign...</div>;
    if (!campaign && !isLoading) return <div className="p-12 text-center">Campaign Not Found</div>;

    const totalEmails = prospects.reduce((sum, p) => sum + (p.outreach_emails?.length || 0), 0);
    const unemailedProspects = prospects.filter(p => !p.outreach_emails || p.outreach_emails.length === 0);

    return (
        <div className="animate-fade-in">
            <Link
                href="/dashboard/campaigns"
                className="mb-6 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Campaigns
            </Link>

            {campaign && (
                <div className="glass-card p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-surface-100">{campaign.name}</h1>
                                <span className={`badge ${campaign.status === "active" ? "badge-active" : "badge-draft"}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <p className="text-sm text-surface-400 max-w-2xl">{campaign.description}</p>
                            <div className="mt-3 flex gap-4 text-xs text-surface-500">
                                <span>Type: <span className="text-surface-300 capitalize">{campaign.campaign_type}</span></span>
                                {campaign.goal_amount && (
                                    <span>Goal: <span className="text-surface-300">${Number(campaign.goal_amount).toLocaleString()}</span></span>
                                )}
                                <span>Prospects: <span className="text-surface-300">{prospects?.length ?? 0}</span></span>
                                <span>Emails: <span className="text-surface-300">{totalEmails}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prospects */}
            {prosError ? (
                <div className="glass-card p-12 text-center border-red-500/30">
                    <Megaphone className="mx-auto h-12 w-12 text-red-500/70 mb-4" />
                    <h3 className="text-lg font-semibold text-surface-300">Error loading prospects</h3>
                    <p className="mt-1 text-sm text-surface-500 mb-6">{prosError.message}</p>
                </div>
            ) : (!prospects || prospects.length === 0) ? (
                <div className="glass-card p-12 text-center">
                    <Search className="mx-auto h-12 w-12 text-surface-600 mb-4" />
                    <h3 className="text-lg font-semibold text-surface-300">No prospects yet</h3>
                    <p className="mt-1 text-sm text-surface-500 mb-6">Search for local businesses to add to this campaign.</p>
                    <Link href={`/dashboard/campaigns/${id}/prospect`} className="btn-primary">
                        <Search className="h-4 w-4" /> Find Prospects
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-surface-200">Prospects ({prospects.length})</h2>
                        <div className="flex items-center gap-3">
                            <Link href={`/dashboard/campaigns/${id}/prospect`} className="btn-secondary">
                                <Search className="h-4 w-4" /> Find More Prospects
                            </Link>

                            {unemailedProspects.length > 0 && (
                                <button
                                    onClick={() => handleBulkGenerate(unemailedProspects)}
                                    disabled={isGeneratingBulk}
                                    className="btn-primary"
                                >
                                    {isGeneratingBulk ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Generating Emals...</>
                                    ) : (
                                        <><Play className="h-4 w-4" /> Bulk Generate Emails ({unemailedProspects.length})</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    {prospects.map((prospect, i) => {
                        const enrichment = Array.isArray(prospect.enrichments) ? prospect.enrichments[0] : prospect.enrichments;
                        const emails = prospect.outreach_emails as Array<Record<string, unknown>> | null;
                        const hasEmail = emails && emails.length > 0;
                        const isGeneratingThis = generatingId === prospect.id;

                        return (
                            <div
                                key={prospect.id}
                                className="glass-card p-5 animate-fade-in"
                                style={{ animationDelay: `${i * 30}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-surface-100">{prospect.name}</h3>
                                            {prospect.rating && (
                                                <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                                                    <Star className="h-3 w-3 fill-current" /> {prospect.rating}
                                                </span>
                                            )}
                                            {prospect.category && (
                                                <span className="badge bg-surface-700/50 text-surface-300">{prospect.category}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-surface-400">
                                            {prospect.address && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {prospect.address}
                                                </span>
                                            )}
                                            {prospect.email && (
                                                <span className="inline-flex items-center gap-1 break-all">
                                                    <Mail className="h-3 w-3" /> {prospect.email}
                                                </span>
                                            )}
                                            {prospect.phone && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {prospect.phone}
                                                </span>
                                            )}
                                            {prospect.website && (
                                                <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300">
                                                    <Globe className="h-3 w-3" /> Website <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            )}
                                        </div>
                                        {enrichment?.summary && (
                                            <p className="mt-2 text-xs text-surface-400 line-clamp-2">{enrichment.summary}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {hasEmail ? (
                                            <span className="badge badge-sent py-2">
                                                <Mail className="h-3 w-3 mr-1" /> Email Generated
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleGenerateEmail(prospect.id)}
                                                disabled={isGeneratingThis || isGeneratingBulk}
                                                className="btn-secondary py-1 px-3 text-sm h-[32px]"
                                            >
                                                {isGeneratingThis ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Generate Email"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
