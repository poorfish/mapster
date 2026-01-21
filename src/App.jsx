import { useState, useCallback } from 'react'
import './App.css'
import SplitPane from './components/SplitPane'
import MapPanel from './components/MapPanel'
import PreviewPanel from './components/PreviewPanel'

function App() {
    // Map state
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]) // Default: London
    const [mapZoom, setMapZoom] = useState(13)
    const [distance, setDistance] = useState(5000) // meters

    // Location state
    const [city, setCity] = useState('London')
    const [country, setCountry] = useState('United Kingdom')

    // Theme state
    const [currentTheme, setCurrentTheme] = useState('feature_based')

    // Map data state
    const [mapData, setMapData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Memoize handlers
    const handleMapChange = useCallback((center, zoom) => {
        setMapCenter(prevCenter => {
            if (Math.abs(prevCenter[0] - center[0]) < 0.00001 &&
                Math.abs(prevCenter[1] - center[1]) < 0.00001) {
                return prevCenter;
            }
            return center;
        })
        setMapZoom(prevZoom => prevZoom === zoom ? prevZoom : zoom)
    }, [])

    const handleLocationSelect = useCallback((location) => {
        setCity(location.city)
        setCountry(location.country)
        setMapCenter([location.lat, location.lon])
        setMapZoom(13)
    }, [])

    const handleThemeChange = useCallback((theme) => setCurrentTheme(theme), [])
    const handleCityChange = useCallback((city) => setCity(city), [])
    const handleCountryChange = useCallback((val) => setCountry(val), [])
    const handleDistanceChange = useCallback((dist) => setDistance(dist), [])

    return (
        <div className="app-container">
            <main className="app-main full-height">
                <SplitPane>
                    <MapPanel
                        center={mapCenter}
                        zoom={mapZoom}
                        distance={distance}
                        onMapChange={handleMapChange}
                        onLocationSelect={handleLocationSelect}
                        onDistanceChange={handleDistanceChange}
                    />
                    <PreviewPanel
                        mapCenter={mapCenter}
                        distance={distance}
                        city={city}
                        country={country}
                        theme={currentTheme}
                        mapData={mapData}
                        isLoading={isLoading}
                        onThemeChange={handleThemeChange}
                        onCityChange={handleCityChange}
                        onCountryChange={handleCountryChange}
                        onDistanceChange={handleDistanceChange}
                    />
                </SplitPane>
            </main>
        </div>
    )
}

export default App
