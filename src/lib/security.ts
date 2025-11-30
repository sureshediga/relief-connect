// Security utilities for Relief Connect
// Implements comprehensive security measures and data privacy compliance

import { NextRequest } from 'next/server'
import crypto from 'crypto'

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  // API endpoints
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
  },
  // Help request submission
  HELP_REQUEST: {
    windowMs: 60 * 1000, // 1 minute
    max: 3, // limit each IP to 3 help requests per minute
  },
  // Volunteer registration
  VOLUNTEER_REGISTRATION: {
    windowMs: 60 * 1000, // 1 minute
    max: 2, // limit each IP to 2 registrations per minute
  },
  // Message sending
  MESSAGE_SENDING: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 messages per minute
  }
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

/**
 * Input validation and sanitization
 */
export class InputValidator {
  /**
   * Sanitize HTML input to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): {
    valid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
    } else {
      score += 1
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    return {
      valid: score >= 4,
      score,
      feedback
    }
  }

  /**
   * Validate and sanitize text input
   */
  static sanitizeText(input: string, maxLength: number = 1000): string {
    return this.sanitizeHtml(input.trim().substring(0, maxLength))
  }

  /**
   * Validate geographic coordinates
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }

  /**
   * Validate disaster type
   */
  static isValidDisasterType(type: string): boolean {
    const validTypes = [
      'HURRICANE', 'FLOOD', 'WILDFIRE', 'EARTHQUAKE', 
      'TORNADO', 'DROUGHT', 'PANDEMIC', 'OTHER'
    ]
    return validTypes.includes(type)
  }

  /**
   * Validate urgency level
   */
  static isValidUrgency(urgency: string): boolean {
    const validUrgencies = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']
    return validUrgencies.includes(urgency)
  }
}

/**
 * Encryption utilities
 */
export class Encryption {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  private static readonly TAG_LENGTH = 16

  /**
   * Generate a secure random key
   */
  static generateKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex')
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const cipher = crypto.createCipher(this.ALGORITHM, key)
    cipher.setAAD(Buffer.from('relief-connect'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedText: string, key: string): string {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const tag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipher(this.ALGORITHM, key)
    decipher.setAAD(Buffer.from('relief-connect'))
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Hash password with salt
   */
  static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return { hash, salt }
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === hashVerify
  }
}

/**
 * Rate limiting implementation
 */
export class RateLimiter {
  private static cache = new Map<string, { count: number; resetTime: number }>()

  /**
   * Check if request is within rate limit
   */
  static isAllowed(
    identifier: string, 
    limit: number, 
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = `${identifier}:${Math.floor(now / windowMs)}`
    
    const current = this.cache.get(key)
    
    if (!current) {
      this.cache.set(key, { count: 1, resetTime: now + windowMs })
      return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
    }
    
    if (current.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }
    
    current.count++
    return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime }
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    const now = Date.now()
    this.cache.forEach((value, key) => {
      if (value.resetTime < now) {
        this.cache.delete(key)
      }
    })
  }
}

/**
 * Security audit logging
 */
export class SecurityAudit {
  /**
   * Log security events
   */
  static logEvent(
    event: string,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      source: 'relief-connect'
    }
    
    // In production, send to security monitoring service
    console.log('SECURITY_AUDIT:', JSON.stringify(logEntry))
  }

  /**
   * Log authentication events
   */
  static logAuthEvent(
    event: 'login' | 'logout' | 'failed_login' | 'password_reset',
    userId: string,
    ip: string,
    userAgent: string
  ): void {
    this.logEvent(`auth_${event}`, {
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }, event === 'failed_login' ? 'high' : 'medium')
  }

  /**
   * Log data access events
   */
  static logDataAccess(
    resource: string,
    action: 'read' | 'write' | 'delete',
    userId: string,
    ip: string
  ): void {
    this.logEvent('data_access', {
      resource,
      action,
      userId,
      ip,
      timestamp: new Date().toISOString()
    }, 'low')
  }

  /**
   * Log suspicious activity
   */
  static logSuspiciousActivity(
    activity: string,
    details: Record<string, any>,
    ip: string
  ): void {
    this.logEvent('suspicious_activity', {
      activity,
      details,
      ip,
      timestamp: new Date().toISOString()
    }, 'high')
  }
}

/**
 * Data privacy utilities
 */
export class DataPrivacy {
  /**
   * Anonymize personal data
   */
  static anonymizeData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['email', 'phone', 'ssn', 'address', 'name']
    const anonymized = { ...data }
    
    sensitiveFields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.maskSensitiveData(anonymized[field])
      }
    })
    
    return anonymized
  }

  /**
   * Mask sensitive data
   */
  static maskSensitiveData(value: string): string {
    if (value.length <= 4) {
      return '*'.repeat(value.length)
    }
    
    const visible = Math.max(2, Math.floor(value.length * 0.2))
    const masked = '*'.repeat(value.length - visible)
    return value.substring(0, visible) + masked
  }

  /**
   * Generate data retention policy
   */
  static getDataRetentionPolicy(): Record<string, number> {
    return {
      // User data
      user_profiles: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      user_sessions: 30 * 24 * 60 * 60 * 1000, // 30 days
      
      // Relief efforts
      relief_efforts: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
      help_requests: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
      
      // Communications
      messages: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      notifications: 90 * 24 * 60 * 60 * 1000, // 90 days
      
      // Analytics
      analytics_data: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
      audit_logs: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      
      // Temporary data
      temp_files: 24 * 60 * 60 * 1000, // 24 hours
      cache_data: 60 * 60 * 1000, // 1 hour
    }
  }

  /**
   * Check if data should be deleted based on retention policy
   */
  static shouldDeleteData(
    dataType: string, 
    createdAt: Date
  ): boolean {
    const policy = this.getDataRetentionPolicy()
    const retentionPeriod = policy[dataType]
    
    if (!retentionPeriod) {
      return false // Keep data if no policy defined
    }
    
    const now = new Date()
    const age = now.getTime() - createdAt.getTime()
    
    return age > retentionPeriod
  }

  /**
   * Generate GDPR compliance report
   */
  static generateGDPRReport(userId: string): {
    personalData: string[]
    dataSources: string[]
    retentionPeriods: Record<string, string>
    rights: string[]
  } {
    return {
      personalData: [
        'Name, email, phone number',
        'Location data (if provided)',
        'Volunteer information',
        'Help request details',
        'Communication history'
      ],
      dataSources: [
        'User registration',
        'Volunteer registration',
        'Help request submission',
        'Communication logs',
        'Analytics data'
      ],
      retentionPeriods: {
        'Personal Information': '7 years',
        'Communication Data': '2 years',
        'Analytics Data': '3 years',
        'Audit Logs': '7 years'
      },
      rights: [
        'Right to access your personal data',
        'Right to rectification of inaccurate data',
        'Right to erasure (right to be forgotten)',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object to processing',
        'Right to withdraw consent'
      ]
    }
  }
}

/**
 * Request security utilities
 */
export class RequestSecurity {
  /**
   * Get client IP address
   */
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(',')[0].trim()
    
    return 'unknown'
  }

  /**
   * Check if request is from a trusted source
   */
  static isTrustedSource(request: NextRequest): boolean {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    const trustedDomains = [
      'relief-connect.com',
      'www.relief-connect.com',
      'localhost:3000'
    ]
    
    if (origin) {
      return trustedDomains.some(domain => origin.includes(domain))
    }
    
    if (referer) {
      return trustedDomains.some(domain => referer.includes(domain))
    }
    
    return false
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(
    request: NextRequest, 
    token: string
  ): boolean {
    const csrfToken = request.headers.get('x-csrf-token')
    return csrfToken === token
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}

/**
 * Content Security Policy utilities
 */
export class CSP {
  /**
   * Generate CSP header
   */
  static generateCSPHeader(environment: 'development' | 'production'): string {
    const baseDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]

    if (environment === 'development') {
      baseDirectives.push("script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:*")
    }

    return baseDirectives.join('; ')
  }

  /**
   * Validate CSP violation
   */
  static validateCSPViolation(violation: any): boolean {
    // Log CSP violations for monitoring
    SecurityAudit.logEvent('csp_violation', {
      violatedDirective: violation.violatedDirective,
      blockedURI: violation.blockedURI,
      sourceFile: violation.sourceFile,
      lineNumber: violation.lineNumber
    }, 'medium')

    return true
  }
}
