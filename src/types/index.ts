// Core types for the Relief Connect platform

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  password: string | null
  emailVerified: Date | null
  phoneVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Effort {
  id: string
  slug: string
  name: string
  description?: string
  disasterType: DisasterType
  status: EffortStatus
  affectedArea: GeoJSON.Polygon | GeoJSON.Point
  organizerId: string
  organizer: User
  organizationName: string
  organizationType: OrganizationType
  taxId?: string
  website?: string
  socialMedia?: SocialMediaLinks
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  secondaryContactName?: string
  secondaryContactEmail?: string
  secondaryContactPhone?: string
  primaryLanguage: string
  timezone: string
  branding?: EffortBranding
  verified: boolean
  verifiedAt?: Date
  verificationNotes?: string
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  endedAt?: Date
}

export interface HelpRequest {
  id: string
  effortId: string
  requesterId?: string
  type: HelpRequestType
  urgency: UrgencyLevel
  title: string
  description: string
  location: GeoJSON.Point
  contactName: string
  contactPhone: string
  contactEmail?: string
  canText: boolean
  status: RequestStatus
  assignedTo?: string
  assignedAt?: Date
  resolvedAt?: Date
  photos: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Volunteer {
  id: string
  effortId: string
  userId?: string
  name: string
  email: string
  phone: string
  skills: string[]
  availability?: AvailabilitySchedule
  location?: GeoJSON.Point
  status: VolunteerStatus
  verified: boolean
  backgroundCheckPassed: boolean
  emergencyContact?: string
  totalHours: number
  lastActive?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Resource {
  id: string
  effortId: string
  name: string
  description?: string
  category: ResourceCategory
  type: ResourceType
  quantity: number
  unit: string
  location?: GeoJSON.Point
  status: ResourceStatus
  condition?: string
  expiryDate?: Date
  source?: string
  donorId?: string
  distributed: number
  createdAt: Date
  updatedAt: Date
}

export interface Donation {
  id: string
  effortId: string
  donorId?: string
  type: DonationType
  amount?: number
  description: string
  category?: string
  donorName: string
  donorEmail?: string
  donorPhone?: string
  anonymous: boolean
  status: DonationStatus
  processedAt?: Date
  paymentIntentId?: string
  paymentMethod?: string
  createdAt: Date
  updatedAt: Date
}

export interface Communication {
  id: string
  effortId: string
  authorId: string
  type: CommunicationType
  title: string
  content: string
  channels: CommunicationChannel[]
  targetAudience?: TargetAudience
  status: CommunicationStatus
  scheduledAt?: Date
  sentAt?: Date
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  createdAt: Date
  updatedAt: Date
}

export interface EffortMember {
  id: string
  effortId: string
  userId: string
  role: EffortRole
  joinedAt: Date
  active: boolean
  user?: User
  effort?: Effort
}

export interface EffortInvitation {
  id: string
  effortId: string
  email: string
  role: EffortRole
  invitedBy: string
  token: string
  status: InvitationStatus
  expiresAt: Date
  acceptedAt?: Date
  createdAt: Date
  updatedAt: Date
  effort?: Effort
  inviter?: User
}

export interface Alert {
  id: string
  effortId: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  targetArea?: GeoJSON.Polygon
  targetRoles: string[]
  active: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EffortAnalytics {
  id: string
  effortId: string
  date: Date
  totalRequests: number
  resolvedRequests: number
  activeVolunteers: number
  totalVolunteers: number
  totalDonations: number
  peopleHelped: number
  avgResponseTime?: number
  avgResolutionTime?: number
  createdAt: Date
}

// Enums
export enum DisasterType {
  HURRICANE = 'HURRICANE',
  FLOOD = 'FLOOD',
  WILDFIRE = 'WILDFIRE',
  EARTHQUAKE = 'EARTHQUAKE',
  TORNADO = 'TORNADO',
  DROUGHT = 'DROUGHT',
  PANDEMIC = 'PANDEMIC',
  OTHER = 'OTHER'
}

export enum EffortStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED'
}

export enum OrganizationType {
  NONPROFIT = 'NONPROFIT',
  GOVERNMENT = 'GOVERNMENT',
  FAITH_BASED = 'FAITH_BASED',
  COMMUNITY_GROUP = 'COMMUNITY_GROUP',
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER'
}

export enum EffortRole {
  ORGANIZER = 'ORGANIZER',
  COORDINATOR = 'COORDINATOR',
  VOLUNTEER = 'VOLUNTEER',
  VIEWER = 'VIEWER'
}

export enum VolunteerStatus {
  REGISTERED = 'REGISTERED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  REMOVED = 'REMOVED'
}

export enum ResourceType {
  FOOD = 'FOOD',
  WATER = 'WATER',
  SHELTER = 'SHELTER',
  MEDICAL = 'MEDICAL',
  CLOTHING = 'CLOTHING',
  TOOLS = 'TOOLS',
  FUEL = 'FUEL',
  OTHER = 'OTHER'
}

export enum HelpRequestType {
  SHELTER = 'SHELTER',
  FOOD = 'FOOD',
  WATER = 'WATER',
  MEDICAL = 'MEDICAL',
  EVACUATION = 'EVACUATION',
  SUPPLIES = 'SUPPLIES',
  TRANSPORTATION = 'TRANSPORTATION',
  COMMUNICATION = 'COMMUNICATION',
  OTHER = 'OTHER'
}

export enum UrgencyLevel {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  IMPORTANT = 'IMPORTANT',
  ROUTINE = 'ROUTINE'
}

export enum RequestStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum ResourceCategory {
  FOOD = 'FOOD',
  WATER = 'WATER',
  SHELTER = 'SHELTER',
  MEDICAL = 'MEDICAL',
  CLOTHING = 'CLOTHING',
  HYGIENE = 'HYGIENE',
  TOOLS = 'TOOLS',
  EQUIPMENT = 'EQUIPMENT',
  TRANSPORTATION = 'TRANSPORTATION',
  OTHER = 'OTHER'
}

export enum ResourceType {
  PHYSICAL = 'PHYSICAL',
  SERVICE = 'SERVICE',
  FINANCIAL = 'FINANCIAL',
  INFORMATION = 'INFORMATION'
}

export enum ResourceStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  DISTRIBUTED = 'DISTRIBUTED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED'
}

export enum DonationType {
  MONETARY = 'MONETARY',
  PHYSICAL = 'PHYSICAL',
  SERVICE = 'SERVICE',
  TIME = 'TIME'
}

export enum DonationStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum CommunicationType {
  UPDATE = 'UPDATE',
  ALERT = 'ALERT',
  REQUEST = 'REQUEST',
  THANK_YOU = 'THANK_YOU',
  REMINDER = 'REMINDER',
  NEWSLETTER = 'NEWSLETTER'
}

export enum CommunicationStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export enum AlertType {
  EMERGENCY = 'EMERGENCY',
  SAFETY = 'SAFETY',
  WEATHER = 'WEATHER',
  RESOURCE = 'RESOURCE',
  VOLUNTEER = 'VOLUNTEER',
  GENERAL = 'GENERAL'
}

export enum AlertSeverity {
  EMERGENCY = 'EMERGENCY',
  URGENT = 'URGENT',
  IMPORTANT = 'IMPORTANT',
  INFO = 'INFO'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export enum CommunicationChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

// Additional type definitions
export interface SocialMediaLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  website?: string
}

export interface EffortBranding {
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  tagline?: string
  customCSS?: string
}

export interface AvailabilitySchedule {
  monday?: TimeSlot[]
  tuesday?: TimeSlot[]
  wednesday?: TimeSlot[]
  thursday?: TimeSlot[]
  friday?: TimeSlot[]
  saturday?: TimeSlot[]
  sunday?: TimeSlot[]
}

export interface TimeSlot {
  start: string // HH:MM format
  end: string // HH:MM format
}

export interface TargetAudience {
  geographic?: GeoJSON.Polygon
  roles?: string[]
  custom?: Record<string, any>
}

// GeoJSON types
export namespace GeoJSON {
  export interface Point {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }

  export interface Polygon {
    type: 'Polygon'
    coordinates: number[][][]
  }

  export interface Feature {
    type: 'Feature'
    geometry: Point | Polygon
    properties?: Record<string, any>
  }

  export interface FeatureCollection {
    type: 'FeatureCollection'
    features: Feature[]
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateEffortForm {
  // Step 1: Disaster Information
  disasterName: string
  disasterType: DisasterType
  disasterDate: Date
  expectedDuration: string
  description: string

  // Step 2: Geographic Scope
  affectedArea: GeoJSON.Polygon | GeoJSON.Point
  primaryCity: string
  radius?: number

  // Step 3: Organizer Information
  organizationName: string
  organizationType: OrganizationType
  taxId?: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  secondaryContactName?: string
  secondaryContactEmail?: string
  secondaryContactPhone?: string
  website?: string
  socialMedia?: SocialMediaLinks
  bio: string

  // Step 4: Effort Configuration
  primaryLanguage: string
  logo?: File
  primaryColor?: string
  secondaryColor?: string
  tagline?: string
  helpRequestCategories: HelpRequestType[]
  resourceTypes: ResourceCategory[]
  publicVisibility: boolean
}

export interface HelpRequestForm {
  type: HelpRequestType
  urgency: UrgencyLevel
  title: string
  description: string
  location: GeoJSON.Point
  contactName: string
  contactPhone: string
  contactEmail?: string
  canText: boolean
  photos?: File[]
}

export interface VolunteerRegistrationForm {
  name: string
  email: string
  phone: string
  skills: string[]
  availability: AvailabilitySchedule
  location?: GeoJSON.Point
  emergencyContact: string
  backgroundCheckConsent: boolean
}

// Dashboard types
export interface DashboardStats {
  totalRequests: number
  resolvedRequests: number
  pendingRequests: number
  activeVolunteers: number
  totalVolunteers: number
  totalDonations: number
  peopleHelped: number
  avgResponseTime: number
  avgResolutionTime: number
}

export interface MapMarker {
  id: string
  position: [number, number]
  type: 'help-request' | 'resource' | 'volunteer' | 'shelter'
  data: any
  urgency?: UrgencyLevel
}

// Search and filter types
export interface EffortSearchFilters {
  disasterType?: DisasterType[]
  status?: EffortStatus[]
  location?: {
    center: [number, number]
    radius: number
  }
  organizationType?: OrganizationType[]
  verified?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface HelpRequestFilters {
  type?: HelpRequestType[]
  urgency?: UrgencyLevel[]
  status?: RequestStatus[]
  assignedTo?: string
  dateRange?: {
    start: Date
    end: Date
  }
  location?: {
    center: [number, number]
    radius: number
  }
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
  actionText?: string
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    showLocation: boolean
    showContactInfo: boolean
    allowDirectMessages: boolean
  }
  accessibility: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
  }
  language: string
  timezone: string
}
