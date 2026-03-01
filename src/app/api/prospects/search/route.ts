import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const category = searchParams.get("category");

    if (!location || !category) {
        return NextResponse.json(
            { error: "Both 'location' and 'category' parameters are required." },
            { status: 400 }
        );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        // Return mock data when no API key is configured (development mode)
        return NextResponse.json({
            results: generateMockResults(category, location),
            mock: true,
        });
    }

    try {
        // Google Places Text Search API
        const query = encodeURIComponent(`${category} near ${location}`);
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            return NextResponse.json(
                { error: `Google Places API error: ${data.status}` },
                { status: 502 }
            );
        }

        const results = (data.results || []).slice(0, 20).map((place: Record<string, unknown>) => ({
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            category: category,
            // Note: phone and website require a Place Details API call
            phone: null,
            website: null,
        }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Places API error:", error);
        return NextResponse.json({ error: "Failed to search for businesses" }, { status: 500 });
    }
}

// Mock data for development without API key
function generateMockResults(category: string, location: string) {
    const mockBusinesses = [
        { name: `${category} Express`, rating: 4.5 },
        { name: `${location} ${category} Co.`, rating: 4.2 },
        { name: `Premier ${category} Services`, rating: 4.8 },
        { name: `Family ${category} & More`, rating: 4.1 },
        { name: `The ${category} Place`, rating: 3.9 },
        { name: `${category} Depot of ${location}`, rating: 4.6 },
        { name: `Main Street ${category}`, rating: 4.3 },
        { name: `${location} Best ${category}`, rating: 4.7 },
    ];

    return mockBusinesses.map((biz, i) => ({
        place_id: `mock_${i}_${Date.now()}`,
        name: biz.name,
        address: `${100 + i * 100} Main St, ${location}`,
        phone: `(555) ${String(100 + i).padStart(3, "0")}-${String(4000 + i * 111).slice(0, 4)}`,
        website: `https://www.${biz.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        category: category,
        rating: biz.rating,
    }));
}
