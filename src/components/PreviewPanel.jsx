import { useState, useMemo, useEffect } from 'react'
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
    fontFamily,
    mapData,
    isLoading,
    orientation,
    aspectRatio,
    onThemeChange,
    onFontChange,
    onCityChange,
    onCountryChange,
    onDistanceChange,
    onOrientationChange,
    onAspectRatioChange,
    onUpdatePreview,
    onSyncStatusChange
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

    // Notify parent about sync status changes
    useEffect(() => {
        if (onSyncStatusChange) {
            onSyncStatusChange(isOutOfSync, handleUpdatePreview)
        }
    }, [isOutOfSync, onSyncStatusChange])



    return (
        <div className="preview-panel">
            <div className="preview-header">
                {/* Left: Download Icon Button */}
                <div className="header-left">
                    <div className="download-wrapper">
                        <button
                            className="icon-button"
                            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                            title="Download Poster"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
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

                {/* Center: Title */}
                <div className="header-center">
                    <h2 className="preview-title">POSTER PREVIEW</h2>
                </div>

                {/* Right: GitHub Link */}
                <div className="header-right">
                    <a
                        href="https://github.com/poorfish/maptoposter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                        title="View on GitHub"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
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
                        fontFamily={fontFamily}
                        mapData={mapData}
                        isLoading={isLoading}
                        refreshKey={refreshKey}
                        orientation={orientation}
                        aspectRatio={aspectRatio}
                        onParamsRendered={setRenderedParams}
                    />
                </div>

                <div className="preview-footer-settings glass">
                    {/* LAYOUT Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-title">Layout</span>
                        </div>
                        <div className="footer-setting">
                            <div className="setting-label">Orientation</div>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${orientation === 'portrait' ? 'active' : ''}`}
                                    onClick={() => onOrientationChange('portrait')}
                                >
                                    Portrait
                                </button>
                                <button
                                    className={`toggle-btn ${orientation === 'landscape' ? 'active' : ''}`}
                                    onClick={() => onOrientationChange('landscape')}
                                >
                                    Landscape
                                </button>
                            </div>
                        </div>
                        <div className="footer-setting">
                            <div className="setting-label">Aspect Ratio</div>
                            <select
                                className="ratio-select"
                                value={aspectRatio}
                                onChange={(e) => onAspectRatioChange(e.target.value)}
                            >
                                <option value="2:3">2:3 (Classic)</option>
                                <option value="3:4">3:4 (Standard)</option>
                                <option value="4:5">4:5 (Modern)</option>
                                <option value="1:1">1:1 (Square)</option>
                            </select>
                        </div>
                    </div>

                    <div className="footer-divider" />

                    {/* LABELS Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-title">Labels</span>
                        </div>
                        <div className="footer-setting">
                            <div className="input-group">
                                <div className="setting-label">City</div>
                                <input
                                    type="text"
                                    className="footer-input"
                                    placeholder="City Name"
                                    value={city}
                                    onChange={(e) => onCityChange(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <div className="setting-label">Country</div>
                                <input
                                    type="text"
                                    className="footer-input"
                                    placeholder="Country/Region"
                                    value={country}
                                    onChange={(e) => onCountryChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="footer-divider" />

                    {/* TYPOGRAPHY Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-title">Typography</span>
                        </div>
                        <div className="footer-setting">
                            <div className="setting-label">Font Family</div>
                            <select
                                className="font-select"
                                value={fontFamily}
                                onChange={(e) => onFontChange(e.target.value)}
                            >
                                <option value="Inter">Inter (Sans)</option>
                                <option value="'Playfair Display'">Playfair Display (Serif)</option>
                                <option value="Montserrat">Montserrat (Modern)</option>
                                <option value="'Courier Prime'">Courier Prime (Mono)</option>
                                <option value="'Outfit'">Outfit (Geometric)</option>
                            </select>
                        </div>
                    </div>

                    <div className="footer-divider" />

                    {/* THEME Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-title">Theme</span>
                        </div>
                        <div className="footer-setting">
                            <div className="setting-label">{getTheme(theme).name}</div>
                            <div className="theme-dots-container">
                                {themeNames.map(name => {
                                    const t = getTheme(name);
                                    return (
                                        <button
                                            key={name}
                                            className={`theme-dot ${theme === name ? 'active' : ''}`}
                                            onClick={() => onThemeChange(name)}
                                            style={{ background: t.bg, '--dot-accent': t.road_primary }}
                                            title={t.name}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewPanel
