import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
 try {
 const { email_id } = await request.json();

 if (!email_id) {
 return NextResponse.json({ error: "email_id is required" }, { status: 400 });
 }

 const supabase = await createClient();

 // Fetch the email
 const { data: email, error: fetchError } = await supabase
 .from("outreach_emails")
 .select("*, prospects(name, contact_email), campaigns(user_id)")
 .eq("id", email_id)
 .single();

 if (fetchError || !email) {
 return NextResponse.json({ error: "Email not found" }, { status: 404 });
 }

 // Check if Resend API key is configured
 const resendKey = process.env.RESEND_API_KEY;

 if (!resendKey) {
 // Mark as sent without actually sending (development mode)
 const { data, error } = await supabase
 .from("outreach_emails")
 .update({
 status: "sent",
 sent_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 })
 .eq("id", email_id)
 .select()
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }

 return NextResponse.json({
 email: data,
 mock: true,
 message: "Email marked as sent (no email API key configured — development mode)",
 });
 }

 // Send via Resend API
 try {
 const { data: profile } = await supabase
 .from("profiles")
 .select("contact_email, org_name")
 .eq("id", (email.campaigns as Record<string, string>)?.user_id)
 .single();

 const fromEmail = profile?.contact_email || "noreply@sponsormything.com";
 const fromName = profile?.org_name || "SponsorMyThing";

 const res = await fetch("https://api.resend.com/emails", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${resendKey}`,
 },
 body: JSON.stringify({
 from: `${fromName} <${fromEmail}>`,
 to: [(email.prospects as Record<string, string>)?.contact_email || ""],
 subject: email.subject,
 text: email.body,
 }),
 });

 if (!res.ok) {
 const errData = await res.json();
 throw new Error(errData.message || "Resend API error");
 }

 // Update status
 const { data, error } = await supabase
 .from("outreach_emails")
 .update({
 status: "sent",
 sent_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 })
 .eq("id", email_id)
 .select()
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }

 return NextResponse.json({ email: data });
 } catch (sendError) {
 console.error("Send error:", sendError);
 return NextResponse.json(
 { error: "Failed to send email via Resend" },
 { status: 502 }
 );
 }
 } catch (error) {
 console.error("Send email error:", error);
 return NextResponse.json({ error: "Failed to process send request" }, { status: 500 });
 }
}
