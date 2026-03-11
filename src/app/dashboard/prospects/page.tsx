import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, Megaphone } from "lucide-react";

export default async function ProspectsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, name, prospects(count)")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false });

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">Prospects</h1>
                <p className="mt-1 text-surface-400">
                    Find and manage potential sponsors across all your campaigns.
                </p>
            </div>

            {(!campaigns || campaigns.length === 0) ? (
                <div className="glass-card p-12 text-center">
                    <Megaphone className="mx-auto h-12 w-12 text-surface-600 mb-4" />
                    <h3 className="text-lg font-semibold text-surface-300">No campaigns yet</h3>
                    <p className="mt-1 text-sm text-surface-500 mb-6">Create a campaign first, then search for prospects.</p>
                    <Link href="/dashboard/campaigns/new" className="btn-primary">
                        Create Campaign
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-surface-400">Select a campaign to view or add prospects:</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {campaigns.map((campaign) => {
                            const prospectArr = campaign.prospects as Array<{ count: number }> | null;
                            const count = prospectArr?.[0]?.count ?? 0;

                            return (
                                <Link
                                    key={campaign.id}
                                    href={`/dashboard/campaigns/${campaign.id}`}
                                    className="glass-card glass-card-hover p-5 group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
                                            <Search className="h-4 w-4 text-brand-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-surface-100 group-hover:text-brand-300 transition-colors">
                                                {campaign.name}
                                            </h3>
                                            <p className="text-xs text-surface-500">{count} prospect{count !== 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
