"use client";

import { useState, useTransition } from "react";
import { XSquare } from "lucide-react";
import { deleteCampaign } from "@/app/dashboard/campaigns/actions";
import { useRouter } from "next/navigation";

export function DeleteCampaignButton({
    campaignId,
    variant = "icon",
    redirectUrl
}: {
    campaignId: string;
    variant?: "icon" | "button";
    redirectUrl?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation

        if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        startTransition(async () => {
            try {
                await deleteCampaign(campaignId);
                if (redirectUrl) {
                    router.push(redirectUrl);
                }
            } catch (error) {
                console.error("Failed to delete campaign", error);
                alert("Failed to delete campaign. Please try again.");
                setIsDeleting(false);
            }
        });
    };

    if (variant === "button") {
        return (
            <button
                onClick={handleDelete}
                disabled={isPending || isDeleting}
                className={`btn-secondary border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 ${(isPending || isDeleting) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <XSquare className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Campaign"}
            </button>
        );
    }

    // Default icon-only behavior for overview page
    return (
        <button
            onClick={handleDelete}
            disabled={isPending || isDeleting}
            className={`absolute top-4 right-4 z-10 p-2 border border-surface-600 rounded bg-surface-800/80 text-surface-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors ${(isPending || isDeleting) ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Delete campaign"
        >
            <XSquare className="h-4 w-4" />
        </button>
    );
}
