'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Loader2 } from 'lucide-react'

interface EffortLocationProps {
  affectedArea: any
  organizationName?: string
}

export function EffortLocation({ affectedArea, organizationName }: EffortLocationProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!affectedArea) {
      setLoading(false)
      return
    }

    // Extract coordinates from affectedArea
    let coords: [number, number] | null = null

    try {
      if (affectedArea.type === 'Point') {
        const [lng, lat] = affectedArea.coordinates as [number, number]
        coords = [lat, lng]
      } else if (affectedArea.type === 'Polygon') {
        const ring = (affectedArea.coordinates as number[][][])[0]
        if (ring && Array.isArray(ring) && ring.length > 0) {
          const validCoords: [number, number][] = ring.filter((coord: any): coord is [number, number] => 
            Array.isArray(coord) && coord.length >= 2 && 
            typeof coord[0] === 'number' && typeof coord[1] === 'number'
          )
          
          if (validCoords.length > 0) {
            const sum = validCoords.reduce(
              (acc: [number, number], coord: [number, number]) => [
                acc[0] + coord[1], // sum of lats
                acc[1] + coord[0], // sum of lngs
              ],
              [0, 0] as [number, number]
            )
            coords = [
              sum[0] / validCoords.length, // lat
              sum[1] / validCoords.length, // lng
            ] as [number, number]
          }
        }
      }
    } catch (err) {
      console.error('Error extracting coordinates:', err)
    }

    if (coords) {
      setCoordinates(coords)
      
      // Reverse geocode to get address
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&zoom=10&addressdetails=1`
      )
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const addr = data.address
            const parts = []
            if (addr.road) parts.push(addr.road)
            if (addr.city || addr.town || addr.village) {
              parts.push(addr.city || addr.town || addr.village)
            }
            if (addr.state) parts.push(addr.state)
            if (addr.country) parts.push(addr.country)
            setAddress(parts.length > 0 ? parts.join(', ') : data.display_name || 'Location')
          } else {
            setAddress(data.display_name || 'Location')
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Error reverse geocoding:', err)
          setAddress(organizationName || 'Location')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [affectedArea, organizationName])

  if (!coordinates) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading address...</span>
              </div>
            ) : (
              <p className="text-gray-900">{address || organizationName || 'Location'}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
            </p>
          </div>
          
          <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates[1] - 0.05},${coordinates[0] - 0.05},${coordinates[1] + 0.05},${coordinates[0] + 0.05}&layer=mapnik&marker=${coordinates[0]},${coordinates[1]}`}
              allowFullScreen
            />
          </div>
          
          <div className="text-center">
            <a
              href={`https://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              View on OpenStreetMap
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

