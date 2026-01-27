/**
 * Helper to clean font name by removing extra quotes
 */
function cleanFontName(font) {
    if (!font) return 'Inter';
    return font.replace(/['"]/g, '').trim();
}

/**
 * Serialize SVG to string safely, including external fonts
 */
function getSerializedSVG(svgElement, fontFamily = 'Inter') {
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true);

    // Ensure dimensions are set correctly for export
    const viewBox = svgElement.getAttribute('viewBox')?.split(' ') || [0, 0, 600, 800];
    const width = viewBox[2];
    const height = viewBox[3];
    clonedSvg.setAttribute('width', width);
    clonedSvg.setAttribute('height', height);

    // Create a defs element if it doesn't exist, or use the existing one
    let defs = clonedSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        clonedSvg.prepend(defs);
    }

    // Embed all fonts used in the app so they appear in PNG/SVG export
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.setAttribute('type', 'text/css');

    // Cleanup font name to ensure it works correctly in CSS
    const fontName = cleanFontName(fontFamily);

    // We force the chosen fontFamily on all text elements to ensure cross-viewer compatibility
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@300;400;500;600;700&family=Courier+Prime:wght@400;700&family=Outfit:wght@300;400;500;600;700&family=Nunito:wght@200..900&display=swap');
        
        text, tspan {
            font-family: "${fontName}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
    `;
    defs.appendChild(style);

    // Add XML namespace if not present
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialize the SVG
    const serializer = new XMLSerializer();
    return serializer.serializeToString(clonedSvg);
}

/**
 * Export SVG element as a downloadable file
 */
export function exportSVG(svgElement, filename, fontFamily) {
    if (!svgElement) {
        console.error('No SVG element provided for export');
        return;
    }

    try {
        const svgString = getSerializedSVG(svgElement, fontFamily);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.svg`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`SVG exported successfully: ${filename}.svg using font: ${fontFamily}`);
    } catch (error) {
        console.error('Failed to export SVG:', error);
        throw error;
    }
}

// Import WASM and components for PNG generation
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import wasmUrl from '@resvg/resvg-wasm/index_bg.wasm?url';
import { fontManager } from './FontManager';

let wasmInitialized = false;

/**
 * Initialize WebAssembly module for Resvg
 */
async function initResvg() {
    if (wasmInitialized) return;
    await initWasm(wasmUrl);
    wasmInitialized = true;
}

/**
 * Export SVG element as a high-resolution PNG using Resvg (WASM)
 * This guarantees accurate font rendering by bypassing the browser's limited Canvas API.
 */
export async function exportPNG(svgElement, filename, fontFamily, scale = 3) {
    if (!svgElement) {
        console.error('No SVG element provided for export');
        return;
    }

    try {
        console.log('Starting high-fidelity PNG export with Resvg...');

        // 1. Initialize WASM
        await initResvg();

        // 2. Prepare SVG string
        const svgString = getSerializedSVG(svgElement, fontFamily);

        // 3. Load the specific font data
        // We load multiple weights (400, 700) to ensure the poster renders correctly
        const fontBuffers = await fontManager.loadFontFamily(fontFamily);

        // Also load Inter as a safe fallback
        const interBuffers = await fontManager.loadFontFamily('Inter');

        // 4. Configure Resvg
        // We pass the font buffers to Resvg so it can render text natively
        const opts = {
            fitTo: {
                mode: 'zoom',
                value: scale
            },
            font: {
                fontBuffers: [],
                loadSystemFonts: false, // Browser WASM cannot access system fonts
                defaultFontFamily: 'Inter' // Fallback
            }
        };

        // Add main font buffers
        if (fontBuffers && fontBuffers.length > 0) {
            fontBuffers.forEach(buf => opts.font.fontBuffers.push(buf));
        }

        // Add fallback Inter buffers (if distinct)
        if (cleanFontName(fontFamily) !== 'Inter' && interBuffers && interBuffers.length > 0) {
            interBuffers.forEach(buf => opts.font.fontBuffers.push(buf));
        }

        // 5. Render
        const resvg = new Resvg(svgString, opts);
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        // 6. Create Blob and Download
        const blob = new Blob([pngBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        // Cleanup WASM memory for image
        resvg.free();

        console.log(`PNG exported successfully (High-Fidelity): ${filename}.png`);

    } catch (error) {
        console.error('Failed to export PNG with Resvg:', error);
        throw error;
    }
}

/**
 * Generate filename from city, theme, and font
 */
export function generateFilename(city, theme, fontFamily = '') {
    const citySlug = city.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const themeSlug = theme.toLowerCase().replace(/\s+/g, '_');
    const fontSlug = cleanFontName(fontFamily).toLowerCase().replace(/\s+/g, '_');
    const timestamp = new Date().getTime().toString().slice(-4); // Add small timestamp to break cache

    let name = `${citySlug}_${themeSlug}`;
    if (fontSlug) name += `_${fontSlug}`;
    name += `_${timestamp}`;

    return name;
}
