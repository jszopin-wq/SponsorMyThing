"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, Edit3, CheckCircle, XCircle, Clock, X, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EmailData {
    id: string;
    subject: string;
    body: string;
    status: string;
    prospects?: { name?: string; address?: string };
    campaigns?: { name?: string };
}

export default function OutreachClient({ initialEmails }: { initialEmails: EmailData[] }) {
    const [emails, setEmails] = useState<EmailData[]>(initialEmails);
    const [editingEmail, setEditingEmail] = useState<EmailData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingEmail) return;

        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const subject = formData.get("subject") as string;
        const body = formData.get("body") as string;

        const supabase = createClient();
        const { error } = await supabase
            .from("outreach_emails")
            .update({ subject, body })
            .eq("id", editingEmail.id);

        if (!error) {
            setEmails(emails.map(email =>
                email.id === editingEmail.id ? { ...email, subject, body } : email
            ));
            setEditingEmail(null);
        } else {
            console.error("Failed to save email", error);
            alert("Failed to save email.");
        }
        setIsSaving(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">Outreach</h1>
                <p className="mt-1 text-surface-400">
                    Review, edit, and send your AI-generated sponsorship emails.
                </p>
            </div>

            {emails.length === 0 ? (
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
                            const count = emails.filter((e) => e.status === status).length;
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
                    {emails.map((email, i) => {
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
                                        <button
                                            onClick={() => setEditingEmail(email)}
                                            className="btn-secondary px-3 py-2"
                                            title="Edit"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
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

            {/* Edit Modal */}
            {editingEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface-900 border border-surface-700/50 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-surface-800 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-surface-100">Edit Email</h2>
                                <p className="text-xs text-surface-400 mt-1">
                                    To: {editingEmail.prospects?.name || "Unknown"} (Campaign: {editingEmail.campaigns?.name || "Unknown"})
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingEmail(null)}
                                className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-surface-200 mb-1">
                                    Subject Line
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    id="subject"
                                    defaultValue={editingEmail.subject || ""}
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label htmlFor="body" className="block text-sm font-medium text-surface-200 mb-1">
                                    Email Body
                                </label>
                                <textarea
                                    name="body"
                                    id="body"
                                    rows={14}
                                    defaultValue={editingEmail.body || ""}
                                    className="input-field w-full resize-y flex-1"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setEditingEmail(null)}
                                    className="btn-secondary"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSaving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
