'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, AlertCircle, RefreshCw } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Effort } from '@/types'

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ReliefEffortLocation {
  id: string
  name: string
  slug: string
  description?: string
  disasterType: string
  status: string
  coordinates: [number, number] // [lat, lng] for Leaflet
  verified: boolean
}

interface ReliefEffortsMapProps {
  className?: string
}

// Component to update map view when center changes
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

// Component to fit map bounds to show all markers
function FitBounds({ efforts }: { efforts: ReliefEffortLocation[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (efforts.length > 0) {
      const bounds = L.latLngBounds(
        efforts.map(effort => effort.coordinates)
      )
      // Add some padding
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, efforts])
  
  return null
}

export function ReliefEffortsMap({ className }: ReliefEffortsMapProps) {
  const [efforts, setEfforts] = useState<ReliefEffortLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zipCode, setZipCode] = useState('')
  const [selectedEffort, setSelectedEffort] = useState<ReliefEffortLocation | null>(null)
  const [userCountry, setUserCountry] = useState<string | null>(null)

  // Map center and zoom state (Leaflet uses [lat, lng])
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.0902, -95.7129]) // Default to center of US
  const [mapZoom, setMapZoom] = useState(3)

  // Get user's location and country
  useEffect(() => {
    // First try to get country from IP
    fetchCountryFromIP()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Update map view to user's location (Leaflet uses [lat, lng])
          setMapCenter([latitude, longitude])
          setMapZoom(6)

          // Reverse geocode to get country using OpenStreetMap Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`
            )
            const data = await response.json()
            if (data.address && data.address.country) {
              setUserCountry(data.address.country)
            }
          } catch (err) {
            console.error('Error getting country:', err)
          }
        },
        (err) => {
          console.error('Error getting location:', err)
          // Country already fetched from IP in fetchCountryFromIP
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        }
      )
    }
  }, [])

  // Fallback: Get country from IP
  const fetchCountryFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      if (data.country_name) {
        setUserCountry(data.country_name)
        // Optionally center map on country
        if (data.latitude && data.longitude) {
          setMapCenter([data.latitude, data.longitude])
          setMapZoom(4)
        }
      }
    } catch (err) {
      console.error('Error getting country from IP:', err)
    }
  }

  // Fetch relief efforts
  const fetchEfforts = useCallback(async (searchZip?: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all efforts (ACTIVE, PENDING, etc.) - no status filter
      let url = '/api/efforts?limit=100'
      
      // If zip code is provided, geocode it using OpenStreetMap Nominatim
      if (searchZip) {
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchZip)}&limit=1&addressdetails=1`
          )
          const geocodeData = await geocodeResponse.json()
          
          if (geocodeData && geocodeData.length > 0) {
            const lat = parseFloat(geocodeData[0].lat)
            const lng = parseFloat(geocodeData[0].lon)
            // Center map on zip code location (Leaflet uses [lat, lng])
            setMapCenter([lat, lng])
            setMapZoom(10)
            // You could add radius filtering here if needed
            url += `&lat=${lat}&lng=${lng}&radius=50`
          } else {
            setError('Location not found. Please try a different search term.')
            setLoading(false)
            return
          }
        } catch (geocodeErr) {
          console.error('Error geocoding zip code:', geocodeErr)
          setError('Error searching for location. Please try again.')
          setLoading(false)
          return
        }
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        console.log('Fetched efforts:', result.data.length)
        
        // Extract coordinates from affectedArea GeoJSON
        const effortsWithLocations: ReliefEffortLocation[] = result.data
          .map((effort: any) => {
            let coordinates: [number, number] | null = null

            // Handle different GeoJSON types
            if (effort.affectedArea) {
              try {
                if (effort.affectedArea.type === 'Point') {
                  // Point: coordinates are [lng, lat] in GeoJSON, convert to [lat, lng] for Leaflet
                  const [lng, lat] = effort.affectedArea.coordinates
                  if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
                    coordinates = [lat, lng]
                  }
                } else if (effort.affectedArea.type === 'Polygon') {
                  // Polygon: get centroid of first ring
                  const ring = effort.affectedArea.coordinates[0]
                  console.log(`Effort ${effort.id} Polygon ring:`, ring)
                  
                  if (ring && Array.isArray(ring) && ring.length > 0) {
                    const validCoords = ring.filter((coord: any) => {
                      const isValid = Array.isArray(coord) && coord.length >= 2 && 
                        typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
                        !isNaN(coord[0]) && !isNaN(coord[1])
                      if (!isValid) {
                        console.warn(`Invalid coord in effort ${effort.id}:`, coord)
                      }
                      return isValid
                    })
                    
                    console.log(`Effort ${effort.id} valid coords:`, validCoords.length, 'out of', ring.length)
                    
                    if (validCoords.length > 0) {
                      // GeoJSON Polygon coordinates are [lng, lat] format
                      const sum = validCoords.reduce(
                        (acc: [number, number], coord: [number, number]) => {
                          // coord is [lng, lat] in GeoJSON
                          return [
                            acc[0] + coord[1], // sum of lats
                            acc[1] + coord[0], // sum of lngs
                          ]
                        },
                        [0, 0]
                      )
                      // Calculate centroid and convert to [lat, lng] for Leaflet
                      coordinates = [
                        sum[0] / validCoords.length, // lat
                        sum[1] / validCoords.length, // lng
                      ] as [number, number]
                      console.log(`Effort ${effort.id} calculated centroid:`, coordinates)
                    } else {
                      console.warn(`Effort ${effort.id} has no valid coordinates in polygon ring`)
                    }
                  } else {
                    console.warn(`Effort ${effort.id} has invalid polygon ring:`, ring)
                  }
                }
              } catch (err) {
                console.error(`Error extracting coordinates for effort ${effort.id}:`, err)
              }
            }

            if (!coordinates) {
              console.warn(`Effort ${effort.name} (${effort.id}) has no valid coordinates. affectedArea:`, effort.affectedArea)
            } else if (coordinates[0] === 0 && coordinates[1] === 0) {
              console.warn(`Effort ${effort.name} (${effort.id}) has default coordinates [0, 0]. This might be off-screen.`)
            }

            return coordinates
              ? {
                  id: effort.id,
                  name: effort.name,
                  slug: effort.slug,
                  description: effort.description,
                  disasterType: effort.disasterType,
                  status: effort.status,
                  coordinates,
                  verified: effort.verified,
                }
              : null
          })
          .filter((effort: ReliefEffortLocation | null) => effort !== null)

        console.log('Efforts with valid coordinates:', effortsWithLocations.length)
        console.log('Effort locations:', effortsWithLocations.map(e => ({
          name: e.name,
          status: e.status,
          coordinates: e.coordinates
        })))
        console.log('Efforts breakdown:', {
          total: result.data.length,
          withCoordinates: effortsWithLocations.length,
          statuses: result.data.reduce((acc: any, e: any) => {
            acc[e.status] = (acc[e.status] || 0) + 1
            return acc
          }, {}),
          sampleEffort: result.data[0] ? {
            id: result.data[0].id,
            name: result.data[0].name,
            status: result.data[0].status,
            hasAffectedArea: !!result.data[0].affectedArea,
            affectedAreaType: result.data[0].affectedArea?.type,
            affectedAreaPreview: result.data[0].affectedArea ? {
              type: result.data[0].affectedArea.type,
              coordinatesLength: result.data[0].affectedArea.coordinates?.length,
              firstRingLength: result.data[0].affectedArea.coordinates?.[0]?.length,
              firstCoord: result.data[0].affectedArea.coordinates?.[0]?.[0]
            } : null
          } : null
        })
        
        // Log all efforts that failed coordinate extraction
        const failedEfforts = result.data.filter((e: any) => {
          if (!e.affectedArea) return true
          if (e.affectedArea.type === 'Polygon') {
            const ring = e.affectedArea.coordinates?.[0]
            return !ring || !Array.isArray(ring) || ring.length === 0
          }
          return false
        })
        if (failedEfforts.length > 0) {
          console.warn('Efforts that failed coordinate extraction:', failedEfforts.map((e: any) => ({
            id: e.id,
            name: e.name,
            affectedArea: e.affectedArea
          })))
        }
        setEfforts(effortsWithLocations)
      } else {
        setError('Failed to fetch relief efforts')
      }
    } catch (err) {
      console.error('Error fetching efforts:', err)
      setError('Error loading relief efforts. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEfforts()
  }, [fetchEfforts])

  // Auto-refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing efforts...')
        fetchEfforts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchEfforts])

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing efforts...')
      fetchEfforts()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchEfforts])

  // Handle zip code search
  const handleZipSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipCode.trim()) {
      fetchEfforts(zipCode.trim())
    } else {
      fetchEfforts()
    }
  }

  // Get marker color based on disaster type
  const getMarkerColor = (disasterType: string) => {
    const colors: Record<string, string> = {
      HURRICANE: '#FF6B6B',
      FLOOD: '#4ECDC4',
      WILDFIRE: '#FFA07A',
      EARTHQUAKE: '#FFD93D',
      TORNADO: '#95E1D3',
      DROUGHT: '#F38181',
      PANDEMIC: '#AA96DA',
      OTHER: '#6C757D',
    }
    return colors[disasterType] || '#6C757D'
  }

  // Create custom icon for each marker
  const createCustomIcon = useCallback((color: string, status: string, verified: boolean) => {
    const isPending = status === 'PENDING'
    const borderColor = isPending ? '#FCD34D' : (verified ? '#10B981' : '#6B7280')
    const borderWidth = isPending ? '4px' : '3px'
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          position: relative;
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${borderWidth} solid ${borderColor};
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${isPending ? '<div style="position: absolute; top: -8px; right: -8px; width: 12px; height: 12px; background: #FCD34D; border: 2px solid white; border-radius: 50%;"></div>' : ''}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }, [])

  return (
    <section className={`w-full ${className}`}>
      {/* Search Bar */}
      <div className="mb-4 max-w-2xl mx-auto">
        <form onSubmit={handleZipSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={userCountry ? `Search by zip code or location (Currently viewing: ${userCountry})` : 'Search by zip code or location...'}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="pl-12 pr-32 py-4 text-lg h-14 border-2 border-gray-200 focus:border-primary rounded-xl"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fetchEfforts(zipCode || undefined)}
                disabled={loading}
                className="h-10 w-10"
                title="Refresh map"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                type="submit"
                size="lg"
                className="px-6"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </form>
        {userCountry && !zipCode && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Showing relief efforts. Your location: {userCountry}
          </p>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
        {loading && efforts.length === 0 && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading relief efforts...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => fetchEfforts(zipCode || undefined)}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
          scrollWheelZoom={true}
        >
          <MapViewUpdater center={mapCenter} zoom={mapZoom} />
          
          {/* Fit bounds to show all efforts */}
          <FitBounds efforts={efforts} />
          
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Markers for each relief effort */}
          {efforts.map((effort) => (
            <Marker
              key={effort.id}
              position={effort.coordinates}
              icon={createCustomIcon(getMarkerColor(effort.disasterType), effort.status, effort.verified)}
              eventHandlers={{
                click: () => setSelectedEffort(effort),
              }}
            >
              <Popup
                closeButton={true}
                onClose={() => setSelectedEffort(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-lg mb-1">{effort.name}</h3>
                  {effort.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {effort.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getMarkerColor(effort.disasterType) }}
                    >
                      {effort.disasterType.replace('_', ' ')}
                    </span>
                    {effort.status === 'PENDING' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                      </span>
                    )}
                    {effort.verified && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <a
                    href={`/efforts/${effort.slug}`}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View Details →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF6B6B' }}></div>
          <span>Hurricane</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4ECDC4' }}></div>
          <span>Flood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFA07A' }}></div>
          <span>Wildfire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFD93D' }}></div>
          <span>Earthquake</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#95E1D3' }}></div>
          <span>Tornado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#AA96DA' }}></div>
          <span>Other</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-4 border-yellow-400 bg-gray-300"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          <span>Verified</span>
        </div>
      </div>
    </section>
  )
}
