import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
 try {
 const { prospect_id, campaign_id } = await request.json();

 if (!prospect_id || !campaign_id) {
 return NextResponse.json(
 { error: "prospect_id and campaign_id are required" },
 { status: 400 }
 );
 }

 const supabase = await createClient();

 // Fetch campaign, prospect, and enrichment data
 const [campaignRes, prospectRes, enrichmentRes] = await Promise.all([
 supabase.from("campaigns").select("*").eq("id", campaign_id).single(),
 supabase.from("prospects").select("*").eq("id", prospect_id).single(),
 supabase.from("enrichments").select("*").eq("prospect_id", prospect_id).single(),
 ]);

 const campaign = campaignRes.data;
 const prospect = prospectRes.data;
 const enrichment = enrichmentRes.data;

 if (!campaign || !prospect) {
 return NextResponse.json({ error: "Campaign or prospect not found" }, { status: 404 });
 }

 // Fetch user profile for the sender info
 const { data: profile } = await supabase
 .from("profiles")
 .select("*")
 .eq("id", campaign.user_id)
 .single();

 const orgName = profile?.org_name || "Our Organization";

 // Build the prompt context
 const businessContext = enrichment?.summary || `${prospect.name} is a local ${prospect.category || "business"} located at ${prospect.address || "the local area"}.`;

 const prompt = buildEmailPrompt({
 businessName: prospect.name,
 businessContext,
 campaignName: campaign.name,
 campaignType: campaign.campaign_type,
 campaignDescription: campaign.description,
 goalAmount: campaign.goal_amount,
 orgName,
 });

 // Try OpenAI API, fall back to template-based generation
 const apiKey = process.env.OPENAI_API_KEY;
 let subject = "";
 let body = "";

 if (apiKey) {
 try {
 const res = await fetch("https://api.openai.com/v1/chat/completions", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${apiKey}`,
 },
 body: JSON.stringify({
 model: "gpt-4o-mini",
 messages: [
 {
 role: "system",
 content:
 "You are an expert fundraising copywriter. Write warm, professional sponsorship outreach emails. Be specific and personalized. Output JSON with 'subject' and 'body' keys only.",
 },
 { role: "user", content: prompt },
 ],
 temperature: 0.7,
 response_format: { type: "json_object" },
 }),
 });

 const data = await res.json();
 const content = JSON.parse(data.choices[0].message.content);
 subject = content.subject;
 body = content.body;
 } catch (err) {
 console.error("OpenAI API error, falling back to template:", err);
 const template = generateTemplateEmail({
 businessName: prospect.name,
 campaignName: campaign.name,
 campaignType: campaign.campaign_type,
 campaignDescription: campaign.description,
 orgName,
 });
 subject = template.subject;
 body = template.body;
 }
 } else {
 // No API key — use template
 const template = generateTemplateEmail({
 businessName: prospect.name,
 campaignName: campaign.name,
 campaignType: campaign.campaign_type,
 campaignDescription: campaign.description,
 orgName,
 });
 subject = template.subject;
 body = template.body;
 }

 // Save the generated email
 const { data: email, error } = await supabase
 .from("outreach_emails")
 .insert({
 prospect_id,
 campaign_id,
 subject,
 body,
 status: "draft",
 })
 .select()
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }

 return NextResponse.json({ email });
 } catch (error) {
 console.error("Email generation error:", error);
 return NextResponse.json({ error: "Email generation failed" }, { status: 500 });
 }
}

function buildEmailPrompt(ctx: {
 businessName: string;
 businessContext: string;
 campaignName: string;
 campaignType: string;
 campaignDescription: string;
 goalAmount?: number | null;
 orgName: string;
}) {
 return `
Write a sponsorship outreach email from "${ctx.orgName}" to "${ctx.businessName}".

ABOUT THE BUSINESS:
${ctx.businessContext}

ABOUT THE CAMPAIGN:
- Campaign: "${ctx.campaignName}"
- Type: ${ctx.campaignType}
- Description: ${ctx.campaignDescription}
${ctx.goalAmount ? `- Goal: $${ctx.goalAmount.toLocaleString()}` : ""}

GUIDELINES:
- Be warm, professional, and community-focused
- Reference specific details about the business to show genuine interest
- Clearly explain what you're asking for and what the business gets in return
- Include a clear call-to-action
- Keep it concise (under 250 words for the body)
- Make the subject line compelling and specific (not generic)

Return a JSON object with "subject" and "body" keys.
`.trim();
}

function generateTemplateEmail(ctx: {
 businessName: string;
 campaignName: string;
 campaignType: string;
 campaignDescription: string;
 orgName: string;
}) {
 const typeLabels: Record<string, string> = {
 sponsorship: "sponsorship opportunity",
 donation: "donation request",
 "in-kind": "in-kind donation opportunity",
 fundraiser: "fundraising partnership",
 };

 const ask = typeLabels[ctx.campaignType] || "partnership opportunity";

 return {
 subject: `Community ${ask} — ${ctx.campaignName} | ${ctx.orgName}`,
 body: `Dear ${ctx.businessName} Team,

I hope this message finds you well! My name is [Your Name], and I'm reaching out on behalf of ${ctx.orgName}.

We are currently organizing "${ctx.campaignName}" — ${ctx.campaignDescription}

As a valued member of our local community, we believe ${ctx.businessName} would be an incredible partner for this initiative. Your support would make a meaningful difference for the families and individuals we serve.

We have several ${ask} levels available, and we'd love to find one that works best for your business. In return, sponsors receive recognition across our event materials, social media, and community communications.

Would you be available for a brief call or meeting this week to discuss how we could work together? I'd be happy to share more details about the impact your support would have.

Thank you for considering this opportunity to make a difference in our community!

Warm regards,
[Your Name]
${ctx.orgName}`,
 };
}
