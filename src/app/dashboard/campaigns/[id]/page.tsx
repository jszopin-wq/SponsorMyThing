import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Mail, Globe, Phone, MapPin, Star, ExternalLink } from "lucide-react";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();

 const { data: campaign } = await supabase
 .from("campaigns")
 .select("*")
 .eq("id", id)
 .eq("user_id", user?.id ?? "")
 .single();

 if (!campaign) return notFound();

 const { data: prospects } = await supabase
 .from("prospects")
 .select("*, enrichments(*), outreach_emails(*)")
 .eq("campaign_id", id)
 .order("created_at", { ascending: false });

 const totalEmails = prospects?.reduce((sum, p) => {
 const emails = p.outreach_emails as Array<Record<string, unknown>> | null;
 return sum + (emails?.length ?? 0);
 }, 0) ?? 0;

 return (
 <div className="animate-fade-in">
 <Link
 href="/dashboard/campaigns"
 className="mb-6 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
 >
 <ArrowLeft className="h-4 w-4" /> Back to Campaigns
 </Link>

 {/* Campaign Header */}
 <div className="glass-card p-6 mb-6">
 <div className="flex items-start justify-between">
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
 <Link href={`/dashboard/campaigns/${id}/prospect`} className="btn-primary shrink-0">
 <Search className="h-4 w-4" /> Find Prospects
 </Link>
 </div>
 </div>

 {/* Prospects */}
 {(!prospects || prospects.length === 0) ? (
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
 <h2 className="text-lg font-semibold text-surface-200">Prospects ({prospects.length})</h2>
 {prospects.map((prospect, i) => {
 const enrichment = Array.isArray(prospect.enrichments) ? prospect.enrichments[0] : prospect.enrichments;
 const emails = prospect.outreach_emails as Array<Record<string, unknown>> | null;
 const hasEmail = emails && emails.length > 0;

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
 <div className="flex items-center gap-2 shrink-0">
 {!enrichment && prospect.website && (
 <span className="badge bg-amber-500/10 text-amber-400 text-[10px]">Not enriched</span>
 )}
 {enrichment && !hasEmail && (
 <span className="badge bg-brand-500/10 text-brand-300 text-[10px]">Ready for email</span>
 )}
 {hasEmail && (
 <span className="badge badge-sent text-[10px]">
 <Mail className="h-3 w-3 mr-1" /> Email generated
 </span>
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
