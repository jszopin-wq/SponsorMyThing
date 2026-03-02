import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mail, Send, Edit3, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function OutreachPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: emails } = await supabase
        .from("outreach_emails")
        .select("*, prospects(name, address), campaigns(name)")
        .eq("campaigns.user_id", user?.id ?? "")
        .order("created_at", { ascending: false });

    const filteredEmails = emails?.filter(e => e.campaigns !== null) ?? [];

    const statusIcon = (status: string) => {
        switch (status) {
            case "draft": return <Clock className="h-4 w-4 text-amber-400" />;
            case "approved": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
            case "sent": return <Send className="h-4 w-4 text-brand-400" />;
            case "rejected": return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <Clock className="h-4 w-4 text-surface-500" />;
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "draft": return "badge-draft";
            case "approved": return "badge-active";
            case "sent": return "badge-sent";
            case "rejected": return "badge-rejected";
            default: return "";
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">Outreach</h1>
                <p className="mt-1 text-surface-400">
                    Review, edit, and send your AI-generated sponsorship emails.
                </p>
            </div>

            {filteredEmails.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Mail className="mx-auto h-12 w-12 text-surface-600 mb-4" />
                    <h3 className="text-lg font-semibold text-surface-300">No emails yet</h3>
                    <p className="mt-1 text-sm text-surface-500 mb-6">
                        Generate outreach emails from your campaign prospects.
                    </p>
                    <Link href="/dashboard/campaigns" className="btn-primary">
                        Go to Campaigns
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Stats bar */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {["draft", "approved", "sent", "rejected"].map((status) => {
                            const count = filteredEmails.filter((e) => e.status === status).length;
                            return (
                                <div key={status} className="glass-card p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        {statusIcon(status)}
                                        <span className="text-xl font-bold text-surface-100">{count}</span>
                                    </div>
                                    <span className="text-xs capitalize text-surface-500">{status}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Email list */}
                    {filteredEmails.map((email, i) => {
                        const prospect = email.prospects as Record<string, string> | null;
                        const campaign = email.campaigns as Record<string, string> | null;

                        return (
                            <div
                                key={email.id}
                                className="glass-card p-5 animate-fade-in"
                                style={{ animationDelay: `${i * 30}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-surface-100 truncate">
                                                {prospect?.name || "Unknown Business"}
                                            </h3>
                                            <span className={`badge ${statusBadge(email.status)}`}>{email.status}</span>
                                        </div>
                                        <p className="text-xs text-surface-500 mb-2">
                                            Campaign: {campaign?.name || "—"} • {prospect?.address || ""}
                                        </p>
                                        <p className="text-sm font-medium text-surface-200 mb-1">
                                            Subject: {email.subject || "(no subject)"}
                                        </p>
                                        <p className="text-sm text-surface-400 line-clamp-2">{email.body}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link href={`/dashboard/outreach/${email.id}`} className="btn-secondary px-3 py-2" title="Edit">
                                            <Edit3 className="h-4 w-4" />
                                        </Link>
                                        {email.status === "draft" && (
                                            <button className="btn-primary px-3 py-2" title="Approve & Send">
                                                <Send className="h-4 w-4" />
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
