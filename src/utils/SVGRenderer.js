/**
 * SVGRenderer - Core rendering engine to convert OSM data to SVG elements
 * 
 * Converts roads, water bodies, and parks from OSM data into SVG path/polygon elements
 * with proper styling based on the selected theme.
 */

import { transformToSVG } from './MapDataFetcher';

/**
 * Road width hierarchy (in pixels)
 */
const ROAD_WIDTHS = {
    motorway: 1.5,
    trunk: 1.3,
    primary: 1.2,
    secondary: 1.0,
    tertiary: 0.7,
    residential: 0.4,
    service: 0.3,
    unclassified: 0.5,
    default: 0.5,
};

/**
 * Get road color from theme based on highway type
 */
function getRoadColor(highwayType, theme) {
    const typeMap = {
        motorway: theme.road_motorway,
        trunk: theme.road_motorway,
        primary: theme.road_primary,
        secondary: theme.road_secondary,
        tertiary: theme.road_tertiary,
        residential: theme.road_residential,
        service: theme.road_residential,
        unclassified: theme.road_default,
    };

    return typeMap[highwayType] || theme.road_default;
}

/**
 * Get road width based on highway type
 */
function getRoadWidth(highwayType) {
    return ROAD_WIDTHS[highwayType] || ROAD_WIDTHS.default;
}

/**
 * Convert geometry array to SVG path data
 */
function geometryToPath(geometry, bounds, width = 600, height = 800) {
    if (!geometry || geometry.length === 0) return '';

    const svgPoints = transformToSVG(geometry, bounds, width, height);

    if (svgPoints.length === 0) return '';

    // Start with M (moveto)
    let pathData = `M ${svgPoints[0].x},${svgPoints[0].y}`;

    // Add L (lineto) for remaining points
    for (let i = 1; i < svgPoints.length; i++) {
        pathData += ` L ${svgPoints[i].x},${svgPoints[i].y}`;
    }

    return pathData;
}

/**
 * Convert geometry array to SVG polygon points
 */
function geometryToPolygon(geometry, bounds, width = 600, height = 800) {
    if (!geometry || geometry.length === 0) return '';

    const svgPoints = transformToSVG(geometry, bounds, width, height);

    if (svgPoints.length === 0) return '';

    return svgPoints.map(p => `${p.x},${p.y}`).join(' ');
}

/**
 * Render roads as SVG path elements
 * 
 * @param {Array} roads - Array of road elements from OSM
 * @param {Object} theme - Theme configuration
 * @param {Object} bounds - Coordinate bounds
 * @returns {Array} Array of React SVG path elements
 */
export function renderRoads(roads, theme, bounds) {
    if (!roads || roads.length === 0) return [];

    return roads.map((road, index) => {
        const highwayType = road.tags?.highway || 'unclassified';
        const pathData = geometryToPath(road.geometry, bounds);

        if (!pathData) return null;

        return {
            type: 'path',
            key: `road-${index}`,
            d: pathData,
            stroke: getRoadColor(highwayType, theme),
            strokeWidth: getRoadWidth(highwayType),
            fill: 'none',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        };
    }).filter(Boolean);
}

/**
 * Render water bodies as SVG polygon elements
 * 
 * @param {Array} water - Array of water elements from OSM
 * @param {Object} theme - Theme configuration
 * @param {Object} bounds - Coordinate bounds
 * @returns {Array} Array of React SVG polygon/path elements
 */
export function renderWater(water, theme, bounds) {
    if (!water || water.length === 0) return [];

    return water.map((waterBody, index) => {
        const isArea = waterBody.tags?.natural === 'water';

        if (isArea) {
            // Render as polygon for water areas
            const points = geometryToPolygon(waterBody.geometry, bounds);
            if (!points) return null;

            return {
                type: 'polygon',
                key: `water-${index}`,
                points,
                fill: theme.water,
                stroke: 'none',
            };
        } else {
            // Render as path for waterways (rivers, streams)
            const pathData = geometryToPath(waterBody.geometry, bounds);
            if (!pathData) return null;

            return {
                type: 'path',
                key: `water-${index}`,
                d: pathData,
                stroke: theme.water,
                strokeWidth: 0.8,
                fill: 'none',
                strokeLinecap: 'round',
            };
        }
    }).filter(Boolean);
}

/**
 * Render parks as SVG polygon elements
 * 
 * @param {Array} parks - Array of park elements from OSM
 * @param {Object} theme - Theme configuration
 * @param {Object} bounds - Coordinate bounds
 * @returns {Array} Array of React SVG polygon elements
 */
export function renderParks(parks, theme, bounds) {
    if (!parks || parks.length === 0) return [];

    return parks.map((park, index) => {
        const points = geometryToPolygon(park.geometry, bounds);

        if (!points) return null;

        return {
            type: 'polygon',
            key: `park-${index}`,
            points,
            fill: theme.parks,
            stroke: 'none',
        };
    }).filter(Boolean);
}

/**
 * Sort roads by importance (render less important roads first, so major roads appear on top)
 */
export function sortRoadsByImportance(roads) {
    const importance = {
        motorway: 6,
        trunk: 5,
        primary: 4,
        secondary: 3,
        tertiary: 2,
        residential: 1,
        service: 0,
        unclassified: 1,
    };

    return [...roads].sort((a, b) => {
        const typeA = a.tags?.highway || 'unclassified';
        const typeB = b.tags?.highway || 'unclassified';
        return (importance[typeA] || 1) - (importance[typeB] || 1);
    });
}

/**
 * Render all map elements
 * 
 * @param {Object} osmData - OSM data containing roads, water, parks, bounds
 * @param {Object} theme - Theme configuration
 * @returns {Object} Object containing arrays of SVG elements for each layer
 */
export function renderMapElements(osmData, theme) {
    if (!osmData || !osmData.bounds) {
        return { parks: [], water: [], roads: [] };
    }

    const { roads, water, parks, bounds } = osmData;

    // Sort roads by importance (render minor roads first)
    const sortedRoads = sortRoadsByImportance(roads);

    return {
        parks: renderParks(parks, theme, bounds),
        water: renderWater(water, theme, bounds),
        roads: renderRoads(sortedRoads, theme, bounds),
    };
}
