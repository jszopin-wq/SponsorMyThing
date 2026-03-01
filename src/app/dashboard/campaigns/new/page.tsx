"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";

const campaignTypes = [
    { value: "sponsorship", label: "Sponsorship", description: "Jersey sponsors, event sponsors, naming rights" },
    { value: "donation", label: "Donation", description: "Silent auction items, gift cards, monetary donations" },
    { value: "in-kind", label: "In-Kind", description: "Food, supplies, services, or venue donations" },
    { value: "fundraiser", label: "Fundraiser", description: "Fundraising events, matching gifts" },
];

export default function NewCampaignPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [campaignType, setCampaignType] = useState("sponsorship");
    const [goalAmount, setGoalAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in.");
            setLoading(false);
            return;
        }

        // Ensure profile exists before inserting campaign (for legacy accounts)
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!profile) {
            await supabase.from("profiles").insert({
                id: user.id,
                contact_email: user.email,
                org_name: "",
            });
        }

        const { data, error: insertError } = await supabase
            .from("campaigns")
            .insert({
                user_id: user.id,
                name,
                description,
                campaign_type: campaignType,
                goal_amount: goalAmount ? parseFloat(goalAmount) : null,
            })
            .select()
            .single();

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        router.push(`/dashboard/campaigns/${data.id}`);
        router.refresh();
    };

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            <Link
                href="/dashboard/campaigns"
                className="mb-6 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Campaigns
            </Link>

            <div className="glass-card p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500">
                        <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-100">Create Campaign</h1>
                        <p className="text-sm text-surface-400">Set up a new sponsorship or donation campaign</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Campaign Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="Spring 2026 Little League Jersey Sponsors"
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-surface-300">Campaign Type</label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {campaignTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setCampaignType(type.value)}
                                    className={`rounded-xl border p-4 text-left transition-all ${campaignType === type.value
                                        ? "border-brand-500 bg-brand-500/10"
                                        : "border-surface-700/50 bg-surface-900/30 hover:border-surface-600"
                                        }`}
                                >
                                    <div className={`text-sm font-semibold ${campaignType === type.value ? "text-brand-300" : "text-surface-200"}`}>
                                        {type.label}
                                    </div>
                                    <div className="mt-0.5 text-xs text-surface-500">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field min-h-[100px] resize-y"
                            placeholder="Describe your campaign, what you're looking for, and how sponsors will be recognized..."
                            required
                        />
                    </div>

                    {/* Goal */}
                    <div>
                        <label htmlFor="goal" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Goal Amount (optional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 text-sm">$</span>
                            <input
                                id="goal"
                                type="number"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(e.target.value)}
                                className="input-field pl-7"
                                placeholder="5,000"
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-red-400">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link href="/dashboard/campaigns" className="btn-secondary flex-1 justify-center">
                            Cancel
                        </Link>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Campaign"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
