"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    MapPin,
    Loader2,
    Plus,
    Check,
    Star,
    Globe,
    Phone,
} from "lucide-react";

interface PlaceResult {
    place_id: string;
    name: string;
    address: string;
    phone?: string;
    website?: string;
    category?: string;
    rating?: number;
    added?: boolean;
}

const businessCategories = [
    "Hardware Store",
    "Pizza Restaurant",
    "Auto Repair",
    "Dentist",
    "Insurance Agency",
    "Real Estate Agent",
    "Accountant",
    "Florist",
    "Bakery",
    "Veterinarian",
    "Gym",
    "Car Dealer",
];

export default function ProspectSearchPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSearching(true);

        try {
            const res = await fetch(
                `/api/prospects/search?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`
            );
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Search failed");
                setResults([]);
            } else {
                setResults(data.results || []);
            }
        } catch {
            setError("Failed to search. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    const handleAddProspect = async (place: PlaceResult) => {
        setAddingId(place.place_id);

        const supabase = createClient();
        const { error: insertError } = await supabase.from("prospects").insert({
            campaign_id: campaignId,
            place_id: place.place_id,
            name: place.name,
            address: place.address,
            phone: place.phone,
            website: place.website,
            category: place.category,
            rating: place.rating,
        });

        if (!insertError) {
            setResults((prev) =>
                prev.map((p) => (p.place_id === place.place_id ? { ...p, added: true } : p))
            );
        }

        setAddingId(null);
    };

    return (
        <div className="mx-auto max-w-4xl animate-fade-in">
            <Link
                href={`/dashboard/campaigns/${campaignId}`}
                className="mb-6 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Campaign
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">Find Local Businesses</h1>
                <p className="mt-1 text-surface-400">
                    Search for businesses near you to add as sponsorship prospects.
                </p>
            </div>

            {/* Search Form */}
            <div className="glass-card p-6 mb-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-surface-300">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="City, State or ZIP code"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-surface-300">
                                Business Type
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="category"
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="e.g. Pizza Restaurant"
                                    list="categories"
                                    required
                                />
                                <datalist id="categories">
                                    {businessCategories.map((cat) => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={searching} className="btn-primary">
                        {searching ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4" /> Search Businesses
                            </>
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-surface-200">
                        Results ({results.length})
                    </h2>
                    {results.map((place, i) => (
                        <div
                            key={place.place_id}
                            className="glass-card p-5 animate-fade-in"
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-surface-100">{place.name}</h3>
                                        {place.rating && (
                                            <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                                                <Star className="h-3 w-3 fill-current" /> {place.rating}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-surface-400">
                                        {place.address && (
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {place.address}
                                            </span>
                                        )}
                                        {place.phone && (
                                            <span className="inline-flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {place.phone}
                                            </span>
                                        )}
                                        {place.website && (
                                            <a
                                                href={place.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300"
                                            >
                                                <Globe className="h-3 w-3" /> Website
                                            </a>
                                        )}
                                        {place.category && (
                                            <span className="badge bg-surface-700/50 text-surface-300">{place.category}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddProspect(place)}
                                    disabled={place.added || addingId === place.place_id}
                                    className={`shrink-0 ${place.added ? "btn-secondary text-emerald-400 border-emerald-500/30" : "btn-primary"}`}
                                >
                                    {addingId === place.place_id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : place.added ? (
                                        <>
                                            <Check className="h-4 w-4" /> Added
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" /> Add
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 text-center">
                        <button
                            onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
                            className="btn-secondary"
                        >
                            Done — View Campaign
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
