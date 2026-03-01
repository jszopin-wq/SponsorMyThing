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
    const [distance, setDistance] = useState("5");
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
                `/api/prospects/search?location=${encodeURIComponent(location)}&distance=${distance}&category=${encodeURIComponent(category)}`
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
                                Location (ZIP or City)
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="e.g. 10001 or New York, NY"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="distance" className="mb-1.5 block text-sm font-medium text-surface-300">
                                Distance
                            </label>
                            <div className="relative">
                                <select
                                    id="distance"
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    className="input-field appearance-none"
                                    required
                                >
                                    <option value="1">1 Mile</option>
                                    <option value="2">2 Miles</option>
                                    <option value="5">5 Miles</option>
                                    <option value="10">10 Miles</option>
                                    <option value="25">25 Miles</option>
                                    <option value="50">50 Miles</option>
                                </select>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="category" className="mb-1.5 flex items-center justify-between text-sm font-medium text-surface-300">
                                <span>Specific Business Type</span>
                                <span className="text-xs text-surface-500 font-normal">Optional</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                                <input
                                    id="category"
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Leave blank to search ALL types"
                                    list="categories"
                                />
                                <datalist id="categories">
                                    {businessCategories.map((cat) => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={searching} className="btn-primary w-full sm:w-auto">
                        {searching ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4" /> Find Businesses
                            </>
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            {/* Results */}
            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-8">
                    {Object.entries(
                        results.reduce((acc, place) => {
                            const cat = place.category || "Other";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(place);
                            return acc;
                        }, {} as Record<string, PlaceResult[]>)
                    ).map(([cat, catResults], catIndex) => {
                        const allAdded = catResults.every((p) => p.added);
                        const isAddingCategory = addingId === `cat_${cat}`;

                        return (
                            <div key={cat} className="space-y-3 animate-fade-in" style={{ animationDelay: `${catIndex * 100}ms` }}>
                                <div className="flex items-center justify-between border-b border-surface-700/50 pb-2">
                                    <h2 className="text-xl font-bold text-surface-200">{cat} <span className="text-sm font-normal text-surface-400 ml-2">({catResults.length} found)</span></h2>
                                    <button
                                        onClick={async () => {
                                            setAddingId(`cat_${cat}`);
                                            const unadded = catResults.filter(p => !p.added);

                                            // Insert in parallel for speed
                                            const supabase = createClient();
                                            await Promise.all(unadded.map(place =>
                                                supabase.from("prospects").insert({
                                                    campaign_id: campaignId,
                                                    place_id: place.place_id,
                                                    name: place.name,
                                                    address: place.address,
                                                    phone: place.phone,
                                                    website: place.website,
                                                    category: place.category,
                                                    rating: place.rating,
                                                })
                                            ));

                                            setResults((prev) => prev.map((p) => p.category === cat ? { ...p, added: true } : p));
                                            setAddingId(null);
                                        }}
                                        disabled={allAdded || isAddingCategory}
                                        className={`btn-secondary py-1.5 text-sm ${allAdded ? "text-emerald-400 border-emerald-500/30" : ""}`}
                                    >
                                        {isAddingCategory ? (
                                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding All...</>
                                        ) : allAdded ? (
                                            <><Check className="h-3.5 w-3.5" /> All Added</>
                                        ) : (
                                            <><Plus className="h-3.5 w-3.5" /> Select All {cat}</>
                                        )}
                                    </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {catResults.map((place) => (
                                        <div
                                            key={place.place_id}
                                            className="glass-card p-4 flex flex-col h-full"
                                        >
                                            <div className="flex-1 mb-3">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-semibold text-surface-100 line-clamp-1" title={place.name}>{place.name}</h3>
                                                    {place.rating && (
                                                        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                                            <Star className="h-3 w-3 fill-current" /> {place.rating}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1.5 text-xs text-surface-400">
                                                    {place.address && (
                                                        <span className="flex items-start gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /> <span className="line-clamp-2">{place.address}</span>
                                                        </span>
                                                    )}
                                                    {place.phone && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5 shrink-0" /> {place.phone}
                                                        </span>
                                                    )}
                                                    {place.website && (
                                                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 w-fit">
                                                            <Globe className="h-3.5 w-3.5 shrink-0" /> Website
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddProspect(place)}
                                                disabled={place.added || addingId === place.place_id || isAddingCategory}
                                                className={`w-full py-2 ${place.added ? "btn-secondary text-emerald-400 border-emerald-500/30" : "btn-primary"}`}
                                            >
                                                {addingId === place.place_id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                ) : place.added ? (
                                                    <span className="flex items-center justify-center gap-1.5"><Check className="h-4 w-4" /> Added</span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" /> Add Prospect</span>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div className="pt-8 text-center border-t border-surface-700/50">
                        <button
                            onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
                            className="btn-secondary px-8 py-3"
                        >
                            Done — View Campaign Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
