import { createClient } from "@/lib/supabase/server";
import OutreachClient from "./OutreachClient";

export default async function OutreachPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: emails } = await supabase
        .from("outreach_emails")
        .select("*, prospects(name, address), campaigns(name)")
        .eq("campaigns.user_id", user?.id ?? "")
        .order("created_at", { ascending: false });

    const filteredEmails = emails?.filter(e => e.campaigns !== null) ?? [];

    return <OutreachClient initialEmails={filteredEmails} />;
}
