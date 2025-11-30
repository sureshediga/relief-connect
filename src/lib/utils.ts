import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Crisis-optimized utility functions

/**
 * Format phone number for display and SMS
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

/**
 * Format phone number for SMS (E.164 format)
 */
export function formatPhoneForSMS(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+${cleaned}`
  }
  return phone
}

/**
 * Generate a short, memorable tracking code for help requests
 */
export function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

/**
 * Format time ago for display
 */
export function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  
  return date.toLocaleDateString()
}

/**
 * Format time ago for display (alias for timeAgo)
 */
export function formatTimeAgo(date: Date): string {
  return timeAgo(date)
}

/**
 * Format urgency level for display
 */
export function formatUrgency(urgency: string): {
  label: string
  color: string
  bgColor: string
} {
  switch (urgency) {
    case 'CRITICAL':
      return {
        label: 'Critical',
        color: 'text-white',
        bgColor: 'bg-emergency'
      }
    case 'URGENT':
      return {
        label: 'Urgent',
        color: 'text-white',
        bgColor: 'bg-urgent'
      }
    case 'IMPORTANT':
      return {
        label: 'Important',
        color: 'text-white',
        bgColor: 'bg-important'
      }
    case 'ROUTINE':
      return {
        label: 'Routine',
        color: 'text-white',
        bgColor: 'bg-info'
      }
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-200'
      }
  }
}

/**
 * Format request status for display
 */
export function formatRequestStatus(status: string): {
  label: string
  color: string
  bgColor: string
} {
  switch (status) {
    case 'NEW':
      return {
        label: 'New',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100'
      }
    case 'ASSIGNED':
      return {
        label: 'Assigned',
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100'
      }
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        color: 'text-orange-800',
        bgColor: 'bg-orange-100'
      }
    case 'RESOLVED':
      return {
        label: 'Resolved',
        color: 'text-green-800',
        bgColor: 'bg-green-100'
      }
    case 'CLOSED':
      return {
        label: 'Closed',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100'
      }
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'text-red-800',
        bgColor: 'bg-red-100'
      }
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-200'
      }
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (US format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1]?[\s\-\.]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Sanitize string for display (prevent XSS)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate a random color for avatars
 */
export function getRandomColor(): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate a secure random string
 */
export function generateSecureRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

/**
 * Check if coordinates are within a polygon
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: number[][]
): boolean {
  const [x, y] = point
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

/**
 * Calculate center point of polygon
 */
export function getPolygonCenter(polygon: number[][]): [number, number] {
  let x = 0
  let y = 0
  
  for (const [px, py] of polygon) {
    x += px
    y += py
  }
  
  return [x / polygon.length, y / polygon.length]
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if file is a valid image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Check if file size is within limits
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Generate a data URL from file
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get contrast color (black or white) for background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/**
 * Generate a slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Check if string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Format disaster type for display
 */
export function formatDisasterType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get disaster type icon
 */
export function getDisasterTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    HURRICANE: '🌪️',
    FLOOD: '🌊',
    WILDFIRE: '🔥',
    EARTHQUAKE: '🌍',
    TORNADO: '🌪️',
    DROUGHT: '☀️',
    PANDEMIC: '🦠',
    OTHER: '⚠️'
  }
  return icons[type] || '⚠️'
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  if (typeof Intl === 'undefined') return 'UTC'
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format date for display in user's timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }
  
  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
    timeZone: timezone || getUserTimezone()
  }).format(date)
}
