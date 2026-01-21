/**
 * MapDataFetcher - Utility to fetch OpenStreetMap data from Overpass API
 * 
 * Fetches roads, water bodies, and parks for a given location and radius.
 * Implements caching and rate limiting to avoid excessive API calls.
 */

// Multiple Overpass API instances to rotate between
const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];

let currentServerIndex = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const REQUEST_DELAY = 1000; // 1s delay

// Simple in-memory cache
const cache = new Map();
let lastRequestTime = 0;

/**
 * Build a single combined Overpass QL query for all data types
 */
function buildCombinedQuery(lat, lon, radius) {
    return `
        [out:json][timeout:60];
        (
            way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|service|unclassified"](around:${radius},${lat},${lon});
            way["natural"="water"](around:${radius},${lat},${lon});
            way["waterway"~"river|stream|canal"](around:${radius},${lat},${lon});
            relation["natural"="water"](around:${radius},${lat},${lon});
            way["leisure"="park"](around:${radius},${lat},${lon});
            way["landuse"~"grass|forest|recreation_ground"](around:${radius},${lat},${lon});
        );
        out geom;
    `;
}

/**
 * Douglas-Peucker algorithm for geometry simplification
 */
function simplifyGeometry(points, tolerance = 0.00001) {
    if (points.length <= 2) return points;

    const sqTolerance = tolerance * tolerance;

    function getSqDist(p1, p2) {
        const dx = p1.lon - p2.lon;
        const dy = p1.lat - p2.lat;
        return dx * dx + dy * dy;
    }

    function getSqSegDist(p, p1, p2) {
        let x = p1.lon, y = p1.lat;
        let dx = p2.lon - x, dy = p2.lat - y;

        if (dx !== 0 || dy !== 0) {
            let t = ((p.lon - x) * dx + (p.lat - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2.lon; y = p2.lat;
            } else if (t > 0) {
                x += dx * t; y += dy * t;
            }
        }
        dx = p.lon - x; dy = p.lat - y;
        return dx * dx + dy * dy;
    }

    function simplifyStep(points, first, last, sqTolerance, simplified) {
        let maxSqDist = sqTolerance;
        let index;

        for (let i = first + 1; i < last; i++) {
            const sqDist = getSqSegDist(points[i], points[first], points[last]);
            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - first > 1) simplifyStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyStep(points, index, last, sqTolerance, simplified);
        }
    }

    const simplified = [points[0]];
    simplifyStep(points, 0, points.length - 1, sqTolerance, simplified);
    simplified.push(points[points.length - 1]);
    return simplified;
}

/**
 * Filter elements by type from the combined result
 */
function processElements(elements) {
    let roads = [];
    const water = [];
    const parks = [];

    // Optimization settings
    const MIN_PARK_NODES = 3;
    const SIMPLIFY_TOLERANCE = 0.00002; // Roughly 2 meters
    const DENSE_THRESHOLD = 5000;

    // If data is too dense, we filter out minor roads to keep performance high
    const isVeryDense = elements.length > DENSE_THRESHOLD;
    if (isVeryDense) {
        console.warn(`[MapDataFetcher] Data is very dense (${elements.length} elements). Applying aggressive filtering.`);
    }

    elements.forEach(el => {
        const tags = el.tags || {};
        if (!el.geometry || el.geometry.length < 2) return;

        if (tags.highway) {
            // In dense areas, skip service and unclassified roads
            if (isVeryDense && (tags.highway === 'service' || tags.highway === 'unclassified')) {
                return;
            }

            // Skip extremely short roads (parking lot segments etc)
            if (el.geometry.length < 3 && (tags.highway === 'service' || tags.highway === 'unclassified')) {
                return;
            }

            // Simplify geometry to reduce SVG complexity
            el.geometry = simplifyGeometry(el.geometry, SIMPLIFY_TOLERANCE);
            roads.push(el);
        } else if (tags.natural === 'water' || tags.waterway || tags.water || el.type === 'relation') {
            el.geometry = simplifyGeometry(el.geometry, SIMPLIFY_TOLERANCE);
            water.push(el);
        } else if (tags.leisure === 'park' || tags.landuse === 'grass' || tags.landuse === 'forest' || tags.landuse === 'recreation_ground') {
            if (el.geometry.length >= MIN_PARK_NODES) {
                el.geometry = simplifyGeometry(el.geometry, SIMPLIFY_TOLERANCE);
                parks.push(el);
            }
        }
    });

    return { roads, water, parks };
}

/**
 * Delay execution to respect rate limits
 */
async function respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < REQUEST_DELAY) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();
}

/**
 * Fetch data from Overpass API with retry mechanism and server rotation
 */
async function fetchFromOverpass(query, retries = 3, backoff = 2000) {
    await respectRateLimit();

    const server = OVERPASS_SERVERS[currentServerIndex];

    try {
        console.log(`[MapDataFetcher] Requesting from server: ${server}`);
        const response = await fetch(server, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.status === 429) {
            currentServerIndex = (currentServerIndex + 1) % OVERPASS_SERVERS.length;
            if (retries > 0) {
                console.warn(`[MapDataFetcher] 429 Too Many Requests on ${server}. Rotating server and retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchFromOverpass(query, retries - 1, backoff * 1.5);
            }
            throw new Error('All Overpass servers are currently reporting high load. Please wait a moment and try again.');
        }

        if (response.status === 504 || response.status === 502) {
            currentServerIndex = (currentServerIndex + 1) % OVERPASS_SERVERS.length;
            if (retries > 0) {
                console.warn(`[MapDataFetcher] ${response.status} Server Error on ${server}. Rotating server and retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchFromOverpass(query, retries - 1, backoff * 1.5);
            }
        }

        if (!response.ok) {
            let errorMsg = `Overpass API error: ${response.status} ${response.statusText}`;
            try {
                const text = await response.text();
                if (text.includes('<?xml') || text.includes('<html')) {
                    errorMsg = `Server is currently overloaded or returned an invalid response (Status ${response.status}).`;
                }
            } catch (e) { }
            throw new Error(errorMsg);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.warn('[MapDataFetcher] Received non-JSON response:', text.substring(0, 100));
            throw new Error('Overpass API returned an invalid response format. The server might be busy.');
        }

        const data = await response.json();
        return data.elements || [];
    } catch (error) {
        if (retries > 0 && !error.message.includes('high load')) {
            currentServerIndex = (currentServerIndex + 1) % OVERPASS_SERVERS.length;
            console.warn(`[MapDataFetcher] Connection error with ${server}. Rotating server and retrying in ${backoff}ms...`, error.message);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchFromOverpass(query, retries - 1, backoff * 1.5);
        }
        throw error;
    }
}

/**
 * Generate cache key
 */
function getCacheKey(lat, lon, distance) {
    return `combined_${lat.toFixed(4)}_${lon.toFixed(4)}_${distance}`;
}

/**
 * Calculate consistent bounds based on requested center and radius
 */
function getRequestBounds(lat, lon, radius) {
    // 1 degree of latitude is approximately 111,320 meters
    const latDiff = radius / 111320;
    // 1 degree of longitude is approximately 111,320 * cos(lat) meters
    const lonDiff = radius / (111320 * Math.cos(lat * Math.PI / 180));

    return {
        minLat: lat - latDiff,
        maxLat: lat + latDiff,
        minLon: lon - lonDiff,
        maxLon: lon + lonDiff
    };
}

/**
 * Main function to fetch all OSM data for a location
 */
export async function fetchOSMData(lat, lon, distance) {
    const cacheKey = getCacheKey(lat, lon, distance);

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[MapDataFetcher] Using cached combined data`);
        return cached.data;
    }

    try {
        console.log(`[MapDataFetcher] Fetching combined OSM data for (${lat}, ${lon}) with radius ${distance}m`);

        // Fetch slightly more to ensure the square bounding box is filled.
        // For a 600x800 poster, the diagonal is ~1.33x the radius.
        // 1.35x is sufficient and much more efficient than 1.5x.
        const fetchRadius = distance * 1.35;
        const query = buildCombinedQuery(lat, lon, fetchRadius);
        const elements = await fetchFromOverpass(query);

        const { roads, water, parks } = processElements(elements);

        // Use fixed bounds based on the request to ensure perfect centering
        const bounds = getRequestBounds(lat, lon, distance);

        console.log(`[MapDataFetcher] Processed ${roads.length} roads, ${water.length} water features, ${parks.length} parks`);

        const result = {
            roads,
            water,
            parks,
            bounds,
        };

        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
        });

        return result;
    } catch (error) {
        console.error('[MapDataFetcher] Error fetching OSM data:', error);
        throw error;
    }
}

/**
 * Transform OSM coordinates to SVG coordinate space while preserving aspect ratio
 * 
 * Accounts for Earth's curvature (latitudinal scaling) and fits data 
 * into the target SVG dimensions without stretching.
 */
export function transformToSVG(geometry, bounds, width = 600, height = 800) {
    const { minLat, maxLat, minLon, maxLon } = bounds;

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // Scale factor for longitude based on latitude (Mercator-ish correction)
    const cosLat = Math.cos(centerLat * Math.PI / 180);

    // Degree-equivalent ranges
    const latRange = maxLat - minLat;
    const lonRange = (maxLon - minLon) * cosLat;

    // Use the poster width as the primary reference for scale
    // This ensures the requested radius fits the width of the poster
    const scale = width / lonRange;

    return geometry.map(({ lat, lon }) => {
        // Center-relative coordinates
        const xRel = (lon - centerLon) * cosLat * scale;
        const yRel = (lat - centerLat) * scale;

        // Final SVG coordinates (centered on 300, 400)
        const x = width / 2 + xRel;
        const y = height / 2 - yRel; // SVG Y increases downward

        return { x, y };
    });
}

/**
 * Clear the cache
 */
export function clearCache() {
    cache.clear();
    console.log('[MapDataFetcher] Cache cleared');
}
