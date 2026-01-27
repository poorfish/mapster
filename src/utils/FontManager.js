/**
 * FontManager - Handles fetching and caching of fonts for WASM rendering
 */

// Hardcoded map of stable Google Fonts URLs to ensure reliability
// We load both Regular (400) and Bold (700) to support the poster design
const FONT_MAP = {
    'Inter': {
        400: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
        700: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf'
    },
    'Playfair Display': {
        400: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf',
        700: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf'
    },
    'Montserrat': {
        400: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf',
        700: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf'
    },
    'Courier Prime': {
        400: 'https://fonts.gstatic.com/s/courierprime/v11/u-450q2lgwslOqpF_6gQ8kELWwY.ttf',
        700: 'https://fonts.gstatic.com/s/courierprime/v11/u-4k0q2lgwslOqpF_6gQ8kELY7pMf-c.ttf'
    },
    'Outfit': {
        400: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf',
        700: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf'
    },
    'Nunito': {
        400: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshRTM.ttf',
        700: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmRTM.ttf'
    }
};

class FontManager {
    constructor() {
        this.cache = new Map(); // Cache by URL
    }

    /**
     * Load all variants (weights) for a given family
     * Returns an array of Uint8Array buffers
     */
    async loadFontFamily(family) {
        const cleanFamily = family.replace(/['"]/g, '').trim();
        const config = FONT_MAP[cleanFamily] || FONT_MAP['Inter']; // Fallback to Inter if unknown

        const buffers = [];

        // Fetch both 400 and 700 weights
        const weights = [400, 700];

        console.log(`[FontManager] Loading font family: ${cleanFamily}`);

        await Promise.all(weights.map(async (weight) => {
            const url = config[weight];
            if (!url) return;

            if (this.cache.has(url)) {
                buffers.push(this.cache.get(url));
                return;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const buffer = await response.arrayBuffer();
                const fontData = new Uint8Array(buffer);

                this.cache.set(url, fontData);
                buffers.push(fontData);
                console.log(`[FontManager] Loaded ${cleanFamily} (${weight})`);
            } catch (error) {
                console.error(`[FontManager] Failed to load ${cleanFamily} (${weight}):`, error);
            }
        }));

        return buffers;
    }
}

export const fontManager = new FontManager();
