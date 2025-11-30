'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  AlertTriangle, 
  X, 
  Phone, 
  MapPin, 
  Clock,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmergencyAlertProps {
  title: string
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  timestamp: Date
  location?: string
  contactInfo?: string
  onDismiss?: () => void
  onAction?: () => void
  actionText?: string
}

export function EmergencyAlert({
  title,
  message,
  severity,
  timestamp,
  location,
  contactInfo,
  onDismiss,
  onAction,
  actionText = 'View Details'
}: EmergencyAlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check battery level if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-700'
      case 'HIGH':
        return 'bg-orange-600 text-white border-orange-700'
      case 'MEDIUM':
        return 'bg-yellow-600 text-white border-yellow-700'
      case 'LOW':
        return 'bg-blue-600 text-white border-blue-700'
      default:
        return 'bg-gray-600 text-white border-gray-700'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-6 h-6 animate-pulse" />
      case 'MEDIUM':
        return <AlertTriangle className="w-6 h-6" />
      case 'LOW':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-md mx-auto shadow-2xl border-2 animate-in slide-in-from-bottom-4",
        getSeverityColor(severity)
      )}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getSeverityIcon(severity)}
              <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm opacity-90">
                  {timestamp.toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed opacity-90">
              {message}
            </p>
          </div>

          {/* Location and Contact */}
          {(location || contactInfo) && (
            <div className="space-y-2 mb-4 text-sm">
              {location && (
                <div className="flex items-center space-x-2 opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              )}
              {contactInfo && (
                <div className="flex items-center space-x-2 opacity-90">
                  <Phone className="w-4 h-4" />
                  <span>{contactInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex items-center justify-between mb-4 text-xs opacity-75">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              {batteryLevel !== null && (
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3" />
                  <span>{batteryLevel}%</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Just now</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {onAction && (
              <Button
                onClick={onAction}
                className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
              >
                {actionText}
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1 border-white text-white hover:bg-white hover:bg-opacity-20"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
