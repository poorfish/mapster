import { useState, useMemo } from 'react'
import './PreviewPanel.css'
import PosterRenderer from './PosterRenderer'
import { exportSVG, exportPNG, generateFilename } from '../utils/exportUtils'
import { getThemeNames, getTheme } from '../data/themes'

function PreviewPanel({
    mapCenter,
    distance,
    city,
    country,
    theme,
    mapData,
    isLoading,
    onThemeChange,
    onCityChange,
    onCountryChange,
    onDistanceChange
}) {
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const themeNames = getThemeNames()

    // Store the params that are currently rendered in the poster
    const [renderedParams, setRenderedParams] = useState({ center: null, distance: null })

    // Check if map view is different from current poster
    const isOutOfSync = useMemo(() => {
        if (!renderedParams.center) return true
        const latDiff = Math.abs(renderedParams.center[0] - mapCenter[0])
        const lngDiff = Math.abs(renderedParams.center[1] - mapCenter[1])
        const distDiff = Math.abs(renderedParams.distance - distance)
        return latDiff > 0.0001 || lngDiff > 0.0001 || distDiff > 1
    }, [mapCenter, distance, renderedParams])

    const handleDownload = async (format) => {
        setDownloadMenuOpen(false)
        setIsExporting(true)

        try {
            const posterElement = document.querySelector('.poster-svg-container')
            const svgElement = posterElement?.querySelector('svg')

            if (!svgElement) {
                throw new Error('Poster not found. Please wait for the map to load.')
            }

            const filename = generateFilename(city, theme)

            if (format === 'svg') {
                exportSVG(svgElement, filename)
            } else if (format === 'png') {
                await exportPNG(svgElement, filename, 3)
            }
        } catch (error) {
            console.error('Download failed:', error)
            alert(`Failed to download: ${error.message}`)
        } finally {
            setIsExporting(false)
        }
    }

    const handleUpdatePreview = () => {
        setRefreshKey(prev => prev + 1)
        setRenderedParams({ center: mapCenter, distance: distance })
    }

    return (
        <div className="preview-panel">
            <div className="preview-header">
                <div className="header-left">
                    <h2 className="preview-title">Poster Preview</h2>
                    <button
                        className={`preview-trigger-btn ${isOutOfSync ? 'stale' : ''}`}
                        onClick={handleUpdatePreview}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {isOutOfSync ? 'Refresh Preview' : 'Preview'}
                    </button>
                    {isOutOfSync && <span className="sync-hint-inline">Changes detected</span>}
                </div>

                <div className="preview-actions">
                    <div className="download-wrapper">
                        <button
                            className="action-button primary"
                            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>

                        {downloadMenuOpen && (
                            <div className="download-menu glass">
                                <button className="download-option" onClick={() => handleDownload('png')}>
                                    <span>PNG Image</span>
                                    <span className="format-label">High Res</span>
                                </button>
                                <button className="download-option" onClick={() => handleDownload('svg')}>
                                    <span>SVG Vector</span>
                                    <span className="format-label">Scalable</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="preview-content-container">
                <div className="preview-content">
                    <PosterRenderer
                        mapCenter={mapCenter}
                        distance={distance}
                        city={city}
                        country={country}
                        theme={theme}
                        mapData={mapData}
                        isLoading={isLoading}
                        refreshKey={refreshKey}
                        onParamsRendered={setRenderedParams}
                    />
                </div>

                <div className="preview-footer-settings glass">
                    <div className="footer-setting wide">
                        <div className="setting-label">Location Labels</div>
                        <div className="footer-input-row">
                            <input
                                type="text"
                                className="footer-input"
                                placeholder="City Name"
                                value={city}
                                onChange={(e) => onCityChange(e.target.value)}
                            />
                            <input
                                type="text"
                                className="footer-input"
                                placeholder="Country/Region"
                                value={country}
                                onChange={(e) => onCountryChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="footer-divider" />

                    <div className="footer-setting">
                        <div className="setting-label">Theme: <span>{getTheme(theme).name}</span></div>
                        <div className="theme-dots-row">
                            {themeNames.map(name => (
                                <button
                                    key={name}
                                    className={`theme-dot-mini ${theme === name ? 'active' : ''}`}
                                    onClick={() => onThemeChange(name)}
                                    style={{ backgroundColor: getTheme(name).accent_primary || getTheme(name).road_primary }}
                                    title={getTheme(name).name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewPanel
