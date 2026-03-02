import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function EditOutreachPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: email, error } = await supabase
        .from("outreach_emails")
        .select("*, prospects(name), campaigns(name)")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching email:", error);
    }

    if (!email) notFound();

    async function saveEmail(formData: FormData) {
        "use server";
        const emailId = formData.get("id") as string;
        const subject = formData.get("subject") as string;
        const body = formData.get("body") as string;

        const supabaseServer = await createClient();
        await supabaseServer
            .from("outreach_emails")
            .update({ subject, body })
            .eq("id", emailId);

        revalidatePath("/dashboard/outreach");
        redirect("/dashboard/outreach");
    }

    const isProspect = email.prospects as Record<string, string> | null;
    const isCampaign = email.campaigns as Record<string, string> | null;

    return (
        <div className="max-w-3xl mx-auto py-6 animate-fade-in">
            <Link
                href="/dashboard/outreach"
                className="mb-6 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Outreach
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-surface-100">Edit Email</h1>
                <p className="text-surface-400 text-sm mt-1">
                    To: {isProspect?.name || "Unknown"} (Campaign: {isCampaign?.name || "Unknown"})
                </p>
            </div>

            <form action={saveEmail} className="glass-card p-6 space-y-6">
                <input type="hidden" name="id" value={id} />
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-surface-200 mb-2">
                        Subject Line
                    </label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        defaultValue={email.subject || ""}
                        className="input-field w-full"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-surface-200 mb-2">
                        Email Body
                    </label>
                    <textarea
                        name="body"
                        id="body"
                        rows={12}
                        defaultValue={email.body || ""}
                        className="input-field w-full resize-y"
                        required
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-700/50">
                    <Link href="/dashboard/outreach" className="btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" className="btn-primary">
                        <Save className="h-4 w-4" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
