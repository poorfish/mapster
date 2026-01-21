import { useState, useEffect, useMemo } from 'react'
import { getTheme } from '../data/themes'
import { fetchOSMData } from '../utils/MapDataFetcher'
import { renderMapElements } from '../utils/SVGRenderer'
import './PosterRenderer.css'

function PosterRenderer({ mapCenter, distance, city, country, theme, fontFamily, mapData, isLoading, refreshKey, orientation, aspectRatio, onParamsRendered }) {
    // Calculate dimensions based on aspect ratio and orientation
    const parts = aspectRatio.split(':').map(Number)
    const ratioW = orientation === 'portrait' ? parts[0] : parts[1]
    const ratioH = orientation === 'portrait' ? parts[1] : parts[0]

    let baseWidth, baseHeight
    if (orientation === 'portrait') {
        baseHeight = 800
        baseWidth = (ratioW / ratioH) * baseHeight
    } else {
        baseWidth = 800
        baseHeight = (ratioH / ratioW) * baseWidth
    }

    const width = baseWidth
    const height = baseHeight
    const centerX = width / 2
    const centerY = height / 2

    const currentTheme = getTheme(theme)
    const [osmData, setOsmData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchData = async () => {
        if (!mapCenter || !distance) return

        const [lat, lon] = mapCenter
        setLoading(true)
        setError(null)

        try {
            console.log(`Fetching OSM data for ${city}...`)
            const data = await fetchOSMData(lat, lon, distance)
            setOsmData(data)

            if (onParamsRendered) {
                onParamsRendered({ center: mapCenter, distance })
            }
            console.log('OSM data loaded successfully')
        } catch (err) {
            console.error('Failed to fetch OSM data:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Load data ONLY when refreshKey changes (via manual Preview button)
    useEffect(() => {
        if (refreshKey > 0) {
            fetchData()
        }
    }, [refreshKey])

    // Render SVG elements from OSM data
    const svgElements = useMemo(() => {
        if (!osmData) return { parks: [], water: [], roads: [] }
        // Pass dynamic width and height to SVG transformer
        return renderMapElements(osmData, currentTheme, width, height)
    }, [osmData, currentTheme, width, height])

    const [lat, lon] = mapCenter
    const coords = lat >= 0
        ? `${lat.toFixed(4)}° N / ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`
        : `${Math.abs(lat).toFixed(4)}° S / ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`

    return (
        <div className="poster-renderer">
            {(loading || isLoading) && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>{error ? 'Retrying with different server...' : 'Generating poster...'}</p>
                </div>
            )}

            {error && (
                <div className="error-overlay">
                    <div className="error-message">
                        <h3>Failed to load map data</h3>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button onClick={() => fetchData()}>Retry</button>
                            <button className="secondary" onClick={() => window.location.reload()}>Reload Page</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="poster-svg-container" style={{ background: currentTheme.bg, aspectRatio: `${width}/${height}`, maxWidth: orientation === 'landscape' ? '100%' : '500px' }}>
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="poster-svg"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Background */}
                    <rect width={width} height={height} fill={currentTheme.bg} />

                    {/* Map content */}
                    <g id="map-content">
                        {/* Parks layer (bottom) */}
                        {svgElements.parks.map(element => (
                            <polygon
                                key={element.key}
                                points={element.points}
                                fill={element.fill}
                                stroke={element.stroke}
                            />
                        ))}

                        {/* Water layer */}
                        {svgElements.water.map(element =>
                            element.type === 'polygon' ? (
                                <polygon
                                    key={element.key}
                                    points={element.points}
                                    fill={element.fill}
                                    stroke={element.stroke}
                                />
                            ) : (
                                <path
                                    key={element.key}
                                    d={element.d}
                                    stroke={element.stroke}
                                    strokeWidth={element.strokeWidth}
                                    fill={element.fill}
                                    strokeLinecap={element.strokeLinecap}
                                />
                            )
                        )}

                        {/* Roads layer (top) */}
                        {svgElements.roads.map(element => (
                            <path
                                key={element.key}
                                d={element.d}
                                stroke={element.stroke}
                                strokeWidth={element.strokeWidth}
                                fill={element.fill}
                                strokeLinecap={element.strokeLinecap}
                                strokeLinejoin={element.strokeLinejoin}
                            />
                        ))}

                        {/* Show placeholder if no data yet */}
                        {!osmData && !loading && (
                            <>
                                <circle cx={centerX} cy={centerY} r="150" fill="none" stroke={currentTheme.road_primary} strokeWidth="2" opacity="0.3" />
                                <circle cx={centerX} cy={centerY} r="100" fill="none" stroke={currentTheme.road_secondary} strokeWidth="1.5" opacity="0.3" />
                                <circle cx={centerX} cy={centerY} r="50" fill="none" stroke={currentTheme.road_tertiary} strokeWidth="1" opacity="0.3" />
                                <text x={centerX} y={centerY} textAnchor="middle" fill={currentTheme.text} opacity="0.2" fontSize="14">
                                    Map data will render here
                                </text>
                            </>
                        )}
                    </g>

                    {/* Bottom gradient fade */}
                    <defs>
                        <linearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={currentTheme.gradient_color} stopOpacity="0" />
                            <stop offset="100%" stopColor={currentTheme.gradient_color} stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="topFade" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor={currentTheme.gradient_color} stopOpacity="0" />
                            <stop offset="100%" stopColor={currentTheme.gradient_color} stopOpacity="1" />
                        </linearGradient>
                    </defs>

                    <rect width={width} height={height * 0.25} y="0" fill="url(#topFade)" />
                    <rect width={width} height={height * 0.25} y={height * 0.75} fill="url(#bottomFade)" />

                    {/* Typography Rendering Logic */}
                    {(() => {
                        const cityText = city.toUpperCase();
                        const words = cityText.split(/\s+/);
                        const charCount = cityText.length;

                        // Adaptive configuration
                        let baseFontSize = orientation === 'landscape' ? 36 : 48;
                        let letterSpacingValue = 12;

                        // Decision for multi-line
                        const isMultiLine = charCount > 12 && words.length > 1;
                        const lines = isMultiLine ? words : [cityText];

                        // Calculate scaling for very long single words or lines
                        const padding = 60; // Increased safety margin from edges
                        const maxLineWidth = width - (padding * 2);
                        let currentFontSize = baseFontSize;

                        // Conservative width estimation:
                        // 1. Each character is roughly 0.7 * fontSize (conservative for bold fonts)
                        // 2. We inject two spaces between each char: ' '. Each space is roughly 0.3 * fontSize.
                        // 3. letter-spacing is applied to every character except the last one.
                        const getLineWidth = (text, fSize, spacing) => {
                            const charWidth = text.length * (fSize * 0.7);
                            const injectedSpacesWidth = (text.length - 1) * 2 * (fSize * 0.3);
                            const totalSpacing = (text.length - 1 + (text.length * 2)) * spacing;
                            return charWidth + injectedSpacesWidth + totalSpacing;
                        };

                        // Scale down if any line is too wide
                        let maxLineW = 0;
                        lines.forEach(line => {
                            maxLineW = Math.max(maxLineW, getLineWidth(line, currentFontSize, letterSpacingValue));
                        });

                        if (maxLineW > maxLineWidth) {
                            const scale = maxLineWidth / maxLineW;
                            currentFontSize = Math.max(currentFontSize * scale, 24);
                            letterSpacingValue = Math.max(letterSpacingValue * scale, 4);
                        }

                        // Vertical positioning
                        const lineHeight = currentFontSize * 1.2;
                        const totalTextHeight = lines.length * lineHeight;
                        const cityYStart = height * 0.85 - (totalTextHeight / 2) + (lineHeight / 2);

                        return (
                            <>
                                <text
                                    x={centerX}
                                    y={cityYStart}
                                    textAnchor="middle"
                                    fill={currentTheme.text}
                                    fontSize={currentFontSize}
                                    fontWeight="700"
                                    fontFamily={fontFamily}
                                    style={{ letterSpacing: `${letterSpacingValue}px` }}
                                >
                                    {lines.map((line, i) => (
                                        <tspan
                                            key={i}
                                            x={centerX}
                                            dy={i === 0 ? 0 : lineHeight}
                                        >
                                            {line.split('').join('  ')}
                                        </tspan>
                                    ))}
                                </text>

                                <line
                                    x1={centerX - 60}
                                    y1={height * 0.88 + (lines.length > 1 ? (lines.length - 1) * lineHeight / 2 : 0)}
                                    x2={centerX + 60}
                                    y2={height * 0.88 + (lines.length > 1 ? (lines.length - 1) * lineHeight / 2 : 0)}
                                    stroke={currentTheme.text}
                                    strokeWidth="1"
                                />

                                <text
                                    x={centerX}
                                    y={height * 0.91 + (lines.length > 1 ? (lines.length - 1) * lineHeight / 2 : 0)}
                                    textAnchor="middle"
                                    fill={currentTheme.text}
                                    fontSize={orientation === 'landscape' ? "14" : "18"}
                                    fontWeight="300"
                                    fontFamily={fontFamily}
                                >
                                    {country.toUpperCase()}
                                </text>

                                <text
                                    x={centerX}
                                    y={height * 0.94 + (lines.length > 1 ? (lines.length - 1) * lineHeight / 2 : 0)}
                                    textAnchor="middle"
                                    fill={currentTheme.text}
                                    fontSize="12"
                                    opacity="0.7"
                                    fontFamily={fontFamily}
                                >
                                    {coords}
                                </text>
                            </>
                        );
                    })()}

                    {/* Attribution */}
                    <text
                        x={width - 10}
                        y={height - 10}
                        textAnchor="end"
                        fill={currentTheme.text}
                        fontSize="8"
                        opacity="0.5"
                        fontFamily={fontFamily}
                    >
                        © OpenStreetMap contributors
                    </text>
                </svg>
            </div>
        </div>
    )
}

export default PosterRenderer
