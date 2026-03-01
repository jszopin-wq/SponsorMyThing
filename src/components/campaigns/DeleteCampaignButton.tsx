"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCampaign } from "@/app/dashboard/campaigns/actions";

export function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation

        if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        startTransition(async () => {
            try {
                await deleteCampaign(campaignId);
            } catch (error) {
                console.error("Failed to delete campaign", error);
                alert("Failed to delete campaign. Please try again.");
                setIsDeleting(false);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending || isDeleting}
            className={`absolute top-4 right-4 z-10 p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-400/10 transition-colors ${(isPending || isDeleting) ? "opacity-50 cursor-not-allowed" : ""
                }`}
            aria-label="Delete campaign"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
