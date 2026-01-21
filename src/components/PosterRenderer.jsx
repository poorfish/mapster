import { useState, useEffect, useMemo } from 'react'
import { getTheme } from '../data/themes'
import { fetchOSMData } from '../utils/MapDataFetcher'
import { renderMapElements } from '../utils/SVGRenderer'
import './PosterRenderer.css'

function PosterRenderer({ mapCenter, distance, city, country, theme, mapData, isLoading, refreshKey, onParamsRendered }) {
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
        return renderMapElements(osmData, currentTheme)
    }, [osmData, currentTheme])

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

            <div className="poster-svg-container" style={{ background: currentTheme.bg }}>
                <svg
                    viewBox="0 0 600 800"
                    className="poster-svg"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Background */}
                    <rect width="600" height="800" fill={currentTheme.bg} />

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
                                <circle cx="300" cy="400" r="150" fill="none" stroke={currentTheme.road_primary} strokeWidth="2" opacity="0.3" />
                                <circle cx="300" cy="400" r="100" fill="none" stroke={currentTheme.road_secondary} strokeWidth="1.5" opacity="0.3" />
                                <circle cx="300" cy="400" r="50" fill="none" stroke={currentTheme.road_tertiary} strokeWidth="1" opacity="0.3" />
                                <text x="300" y="400" textAnchor="middle" fill={currentTheme.text} opacity="0.2" fontSize="14">
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

                    <rect width="600" height="200" y="0" fill="url(#topFade)" />
                    <rect width="600" height="200" y="600" fill="url(#bottomFade)" />

                    {/* Typography */}
                    <text
                        x="300"
                        y="680"
                        textAnchor="middle"
                        fill={currentTheme.text}
                        fontSize="48"
                        fontWeight="700"
                        letterSpacing="12"
                        fontFamily="Inter, sans-serif"
                    >
                        {city.toUpperCase().split('').join('  ')}
                    </text>

                    <line
                        x1="240"
                        y1="695"
                        x2="360"
                        y2="695"
                        stroke={currentTheme.text}
                        strokeWidth="1"
                    />

                    <text
                        x="300"
                        y="720"
                        textAnchor="middle"
                        fill={currentTheme.text}
                        fontSize="18"
                        fontWeight="300"
                        fontFamily="Inter, sans-serif"
                    >
                        {country.toUpperCase()}
                    </text>

                    <text
                        x="300"
                        y="745"
                        textAnchor="middle"
                        fill={currentTheme.text}
                        fontSize="12"
                        opacity="0.7"
                        fontFamily="Inter, sans-serif"
                    >
                        {coords}
                    </text>

                    {/* Attribution */}
                    <text
                        x="590"
                        y="790"
                        textAnchor="end"
                        fill={currentTheme.text}
                        fontSize="8"
                        opacity="0.5"
                        fontFamily="Inter, sans-serif"
                    >
                        © OpenStreetMap contributors
                    </text>
                </svg>
            </div>
        </div>
    )
}

export default PosterRenderer
