import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { prospect_id, website_url } = await request.json();

        if (!prospect_id || !website_url) {
            return NextResponse.json(
                { error: "prospect_id and website_url are required" },
                { status: 400 }
            );
        }

        // Fetch the website content
        let pageText = "";
        try {
            const res = await fetch(website_url, {
                headers: {
                    "User-Agent": "SponsorMyThing Bot/1.0 (Non-profit outreach tool)",
                },
                signal: AbortSignal.timeout(10000),
            });

            const html = await res.text();

            // Simple HTML to text extraction
            pageText = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
                .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
                .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 5000); // Limit to 5000 chars

        } catch {
            pageText = "Unable to fetch website content.";
        }

        // Generate a simple summary (in production, use an LLM for this)
        const summary = pageText.length > 100
            ? `Business website content extracted (${pageText.length} characters). Key content: ${pageText.slice(0, 300)}...`
            : "Limited website content available.";

        // Store enrichment in Supabase
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("enrichments")
            .upsert({
                prospect_id,
                scraped_text: pageText,
                summary,
            }, { onConflict: "prospect_id" })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ enrichment: data });
    } catch (error) {
        console.error("Enrichment error:", error);
        return NextResponse.json({ error: "Enrichment failed" }, { status: 500 });
    }
}
