import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Megaphone, ArrowRight } from "lucide-react";
import { DeleteCampaignButton } from "@/components/campaigns/DeleteCampaignButton";

export default async function CampaignsPage() {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();

 const { data: campaigns } = await supabase
 .from("campaigns")
 .select("*, prospects(count)")
 .eq("user_id", user?.id ?? "")
 .order("created_at", { ascending: false });

 return (
 <div className="animate-fade-in">
 <div className="mb-8 flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-surface-100">Campaigns</h1>
 <p className="mt-1 text-surface-400">Manage your sponsorship and donation campaigns.</p>
 </div>
 <Link href="/dashboard/campaigns/new" className="btn-primary">
 <Plus className="h-4 w-4" /> New Campaign
 </Link>
 </div>

 {(!campaigns || campaigns.length === 0) ? (
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
 {campaigns.map((campaign, i) => (
 <div key={campaign.id} className="relative group animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${i * 50}ms` }}>
 <DeleteCampaignButton campaignId={campaign.id} />
 <Link
 href={`/dashboard/campaigns/${campaign.id}`}
 className="glass-card glass-card-hover p-6 block h-full transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/15">
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
 ))}
 </div>
 )}
 </div>
 );
}
