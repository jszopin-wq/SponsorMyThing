import { createClient } from "@/lib/supabase/server";
import OutreachClient from "./OutreachClient";

export default async function OutreachPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: emails, error } = await supabase
        .from("outreach_emails")
        .select("*, prospects(name, address, email), campaigns(name)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch outreach emails:", error);
        return (
            <div className="p-12 text-center border-red-500/30 glass-card mx-auto max-w-2xl mt-8">
                <h3 className="text-lg font-semibold text-red-400">Database Error</h3>
                <p className="mt-2 text-sm text-surface-400">{error.message}</p>
            </div>
        );
    }

    const filteredEmails = emails?.filter(e => e.campaigns !== null) ?? [];

    return <OutreachClient initialEmails={filteredEmails} />;
}
