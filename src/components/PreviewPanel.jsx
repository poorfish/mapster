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
    onAspectRatioChange
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

                <div className="preview-header-right">
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
