"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteCampaign(campaignId: string) {
 const supabase = await createClient();

 const { data: { user } } = await supabase.auth.getUser();

 if (!user) {
 throw new Error("Unauthorized");
 }

 const { error } = await supabase
 .from("campaigns")
 .delete()
 .eq("id", campaignId)
 .eq("user_id", user.id);

 if (error) {
 console.error("Error deleting campaign:", error);
 throw new Error("Failed to delete campaign");
 }

 revalidatePath("/dashboard/campaigns");

 return { success: true };
}
