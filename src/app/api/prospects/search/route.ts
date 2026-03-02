import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const categoryParam = searchParams.get("category");
    const distanceParam = searchParams.get("distance");

    if (!location) {
        return NextResponse.json(
            { error: "'location' parameter is required." },
            { status: 400 }
        );
    }

    try {
        // Step 1: Geocode the location to a bounding box using Nominatim (Free)
        const geocodeRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
            { headers: { "User-Agent": "SponsorMyThing/1.0" } }
        );
        const geocodeData = await geocodeRes.json();

        if (!geocodeData || geocodeData.length === 0) {
            return NextResponse.json({ error: "Location not found. Try a different ZIP code or city." }, { status: 404 });
        }

        // Get Lat and Lon
        const lat = geocodeData[0].lat;
        const lon = geocodeData[0].lon;

        // Convert distance from miles to meters (default to 5 miles if not specified)
        const miles = distanceParam ? parseFloat(distanceParam) : 5;
        const radiusInMeters = Math.round(miles * 1609.34);

        // Step 2: Query Overpass API for real businesses that strictly HAVE email addresses
        // We look for nodes that have either 'email' or 'contact:email', and are a 'shop', 'amenity', or 'office'.
        const query = `
            [out:json][timeout:25];
            (
              node["email"](around:${radiusInMeters},${lat},${lon});
              node["contact:email"](around:${radiusInMeters},${lat},${lon});
              way["email"](around:${radiusInMeters},${lat},${lon});
              way["contact:email"](around:${radiusInMeters},${lat},${lon});
            );
            out body;
            >;
            out skel qt;
        `;

        const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
        });

        const overpassData = await overpassRes.json();

        // Step 3: Format the results
        interface OverpassElement {
            id: number;
            tags?: Record<string, string>;
        }

        const rawResults = overpassData.elements
            .filter((el: OverpassElement) => el.tags && el.tags.name)
            .map((el: OverpassElement) => {
                const tags = el.tags || {};
                const email = tags.email || tags["contact:email"];

                // If the user specified a category, roughly filter for it (Optional)
                const businessCategory = tags.shop || tags.amenity || tags.office || "Local Business";

                if (categoryParam && !businessCategory.toLowerCase().includes(categoryParam.toLowerCase())) {
                    return null; // Skip if it doesn't match the requested category somewhat
                }

                return {
                    place_id: `osm_${el.id}`,
                    name: tags.name,
                    address: tags["addr:street"] ? `${tags["addr:housenumber"] || ""} ${tags["addr:street"]}, ${tags["addr:city"] || location}`.trim() : location,
                    rating: null, // OSM doesn't have ratings natively
                    category: businessCategory.charAt(0).toUpperCase() + businessCategory.slice(1).replace("_", " "),
                    phone: tags.phone || tags["contact:phone"] || null,
                    website: tags.website || tags["contact:website"] || null,
                    email: email, // We pass the email we found directly!
                };
            })
            .filter((item: Record<string, unknown> | null) => item !== null && item.email); // STRICTLY return only those with emails!

        return NextResponse.json({ results: rawResults.slice(0, 50) }); // Limit to 50
    } catch (error) {
        console.error("OSM API error:", error);
        return NextResponse.json({ error: "Failed to search for live businesses" }, { status: 500 });
    }
}


