import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// Utility to parse command-line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result: Record<string, string> = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].replace('--', '');
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
                result[key] = value;
                i++;
            } else {
                result[key] = 'true';
            }
        }
    }
    return result;
}

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'outreach-data');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Define the shape of our business data
interface BusinessInfo {
    name: string;
    website: string;
    address: string;
    email: string | null;
    category: string;
}

// Regex to find generic email addresses in text
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// List of email domains/patterns to ignore (e.g. sentry, examples)
const IGNORE_EMAILS = ['example.com', 'sentry.io', 'domain.com', 'yourdomain.com', '.png', '.jpg'];

// Helper to filter out fake or image emails
function isValidEmail(email: string) {
    const lower = email.toLowerCase();
    for (const ignore of IGNORE_EMAILS) {
        if (lower.includes(ignore)) return false;
    }
    return true;
}

async function geocodeZip(zipCode: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&countrycodes=US`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'SponsorMyThing Scraper/1.0' } });
        const data = await res.json() as any[];
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
    } catch (err) {
        console.error(`Error geocoding zip ${zipCode}:`, err);
    }
    return null;
}

async function findBusinesses(lat: number, lon: number, radiusMeters: number, keyword?: string) {
    // We want any node or way that has a website tag, or contact:website tag
    // We also try to fetch business with email right off the bat as a bonus.
    const query = `
    [out:json][timeout:25];
    (
      node["website"](around:${radiusMeters},${lat},${lon});
      way["website"](around:${radiusMeters},${lat},${lon});
      node["contact:website"](around:${radiusMeters},${lat},${lon});
      way["contact:website"](around:${radiusMeters},${lat},${lon});
      
      node["email"](around:${radiusMeters},${lat},${lon});
      way["email"](around:${radiusMeters},${lat},${lon});
      node["contact:email"](around:${radiusMeters},${lat},${lon});
      way["contact:email"](around:${radiusMeters},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

    try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        if (!res.ok) {
            throw new Error(`Overpass API returned ${res.status}: ${await res.text()}`);
        }

        const data = await res.json() as any;
        const results: BusinessInfo[] = [];

        const elements = data.elements || [];
        for (const el of elements) {
            if (!el.tags || !el.tags.name) continue;

            const website = el.tags.website || el.tags['contact:website'];
            const email = el.tags.email || el.tags['contact:email'];

            if (!website && !email) continue; // we need at least one to be useful

            // Keyword filtering if specified
            const category = el.tags.shop || el.tags.amenity || el.tags.office || el.tags.leisure || 'Local Business';

            if (keyword) {
                const fullText = `${el.tags.name} ${category}`.toLowerCase();
                if (!fullText.includes(keyword.toLowerCase())) {
                    continue;
                }
            }

            const address = el.tags['addr:street']
                ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim()
                : 'Unknown';

            results.push({
                name: el.tags.name,
                website: website || '',
                address: address,
                email: email || null,
                category: category
            });
        }

        // Deduplicate by name and website
        const unique = new Map<string, BusinessInfo>();
        for (const b of results) {
            const key = `${b.name}-${b.website}`;
            if (!unique.has(key)) {
                unique.set(key, b);
            }
        }

        return Array.from(unique.values());
    } catch (err) {
        console.error('Error fetching from Overpass OSM:', err);
        return [];
    }
}

// Fetches a webpage and tries to scrape emails
async function scrapeEmailsFromWebsite(baseUrl: string): Promise<string[]> {
    const emails = new Set<string>();

    if (!baseUrl.startsWith('http')) {
        baseUrl = 'http://' + baseUrl;
    }

    try {
        // 1. Visit homepage
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout per page

        const res = await fetch(baseUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: controller.signal as any
        });
        clearTimeout(timeout);

        const html = await res.text();
        const $ = cheerio.load(html);

        // Look for mailto links
        $('a[href^="mailto:"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                const match = href.replace('mailto:', '').split('?')[0].trim();
                if (isValidEmail(match)) emails.add(match);
            }
        });

        // Look for raw text matches
        const textMatches = html.match(EMAIL_REGEX);
        if (textMatches) {
            for (const m of textMatches) {
                if (isValidEmail(m)) emails.add(m);
            }
        }

        // 2. If no emails found on homepage, try to find a Contact page and scrape that
        if (emails.size === 0) {
            let contactUrl = '';
            $('a').each((_, el) => {
                const text = $(el).text().toLowerCase();
                const href = $(el).attr('href');
                if (href && (text.includes('contact') || href.toLowerCase().includes('contact'))) {
                    // Resolve relative URLs
                    if (href.startsWith('http')) {
                        contactUrl = href;
                    } else if (href.startsWith('/')) {
                        const urlObj = new URL(baseUrl);
                        contactUrl = `${urlObj.origin}${href}`;
                    } else {
                        const urlObj = new URL(baseUrl);
                        contactUrl = `${urlObj.origin}/${href}`;
                    }
                }
            });

            if (contactUrl) {
                try {
                    const cController = new AbortController();
                    const cTimeout = setTimeout(() => cController.abort(), 8000);
                    const cRes = await fetch(contactUrl, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                        signal: cController.signal as any
                    });
                    clearTimeout(cTimeout);

                    const cHtml = await cRes.text();
                    const c$ = cheerio.load(cHtml);

                    c$('a[href^="mailto:"]').each((_, el) => {
                        const href = c$(el).attr('href');
                        if (href) {
                            const match = href.replace('mailto:', '').split('?')[0].trim();
                            if (isValidEmail(match)) emails.add(match);
                        }
                    });

                    const cMatches = cHtml.match(EMAIL_REGEX);
                    if (cMatches) {
                        for (const m of cMatches) {
                            if (isValidEmail(m)) emails.add(m);
                        }
                    }
                } catch (e) {
                    // Ignore errors scraping contact page
                }
            }
        }

    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.log(`⏱️ Timeout scraping ${baseUrl}`);
        } else {
            console.log(`❌ Failed to scrape ${baseUrl} (${err.message})`);
        }
    }

    return Array.from(emails);
}

// Convert data to CSV format
function saveToCSV(filename: string, data: BusinessInfo[]) {
    const header = ['Name', 'Category', 'Address', 'Website', 'Email'];
    const rows = data.map(b => [
        `"${(b.name || '').replace(/"/g, '""')}"`,
        `"${(b.category || '').replace(/"/g, '""')}"`,
        `"${(b.address || '').replace(/"/g, '""')}"`,
        `"${(b.website || '').replace(/"/g, '""')}"`,
        `"${(b.email || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [header.join(',')]
        .concat(rows.map(r => r.join(',')))
        .join('\n');

    fs.writeFileSync(filename, csvContent, 'utf-8');
    console.log(`\n✅ Saved ${data.length} businesses to ${filename}`);
}

async function main() {
    console.log('--- Advanced Local Business Scraper ---');
    const args = parseArgs();

    const zipCode = args.zip || args.zipcode;
    if (!zipCode) {
        console.error('Usage: npm run scrape -- --zip <zip_code> [--keyword <keyword>] [--radius <miles>]');
        process.exit(1);
    }

    const keyword = args.keyword || '';
    const radiusMiles = parseFloat(args.radius || '5');
    const radiusMeters = Math.round(radiusMiles * 1609.34);

    console.log(`\n🔍 Looking up coordinates for ZIP ${zipCode}...`);
    const coords = await geocodeZip(zipCode);
    if (!coords) {
        console.error(`❌ Could not find location for ZIP code: ${zipCode}`);
        process.exit(1);
    }

    console.log(`📍 Found location: lat ${coords.lat}, lon ${coords.lon}`);
    console.log(`🗺️ Searching OSM for businesses ${keyword ? `matching "${keyword}" ` : ''}within ${radiusMiles} miles...`);

    const businesses = await findBusinesses(coords.lat, coords.lon, radiusMeters, keyword);
    if (businesses.length === 0) {
        console.log('No businesses with websites found in this area.');
        process.exit(0);
    }

    console.log(`🏢 Found ${businesses.length} businesses with websites. Starting scraper...`);

    // We'll process them in small batches or sequentially to avoid hitting connection limits
    let foundEmailsCount = 0;
    for (let i = 0; i < businesses.length; i++) {
        const b = businesses[i];

        // If we already got the email from OSM directly, skip scraping
        if (b.email) {
            console.log(`[${i + 1}/${businesses.length}] ✅ Got email directly from OSM for ${b.name}: ${b.email}`);
            foundEmailsCount++;
            continue;
        }

        if (!b.website) {
            console.log(`[${i + 1}/${businesses.length}] ⏭️ No website for ${b.name}, skipping.`);
            continue;
        }

        console.log(`[${i + 1}/${businesses.length}] 🕷️ Scraping ${b.website} (${b.name})...`);
        const scrapedEmails = await scrapeEmailsFromWebsite(b.website);

        if (scrapedEmails.length > 0) {
            // Pick the first reliable looking email
            b.email = scrapedEmails[0];
            console.log(`      🎉 Found email: ${b.email}`);
            foundEmailsCount++;
        } else {
            console.log(`      😔 No emails found.`);
        }
    }

    console.log(`\n🏁 Scraping complete! Found emails for ${foundEmailsCount} out of ${businesses.length} businesses.`);

    // Filter only those we found emails for, if desired. We will export all for now so the user can see progress.
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeKeyword = keyword ? `-${keyword.replace(/\s+/g, '-')}` : '';
    const outPath = path.join(outputDir, `prospects-${zipCode}${safeKeyword}-${timestamp}.csv`);

    saveToCSV(outPath, businesses);
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
