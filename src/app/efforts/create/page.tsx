'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, MapPin, Users, Settings, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DisasterType, OrganizationType } from '@/types'

interface FormData {
  // Step 1: Disaster Information
  disasterName: string
  disasterType: DisasterType
  disasterDate: string
  expectedDuration: string
  description: string

  // Step 2: Geographic Scope
  affectedArea: {
    type: 'Polygon'
    coordinates: number[][][]
  } | null
  primaryCity: string
  radius: number

  // Step 3: Organizer Information
  organizationName: string
  organizationType: OrganizationType
  taxId: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  secondaryContactName: string
  secondaryContactEmail: string
  secondaryContactPhone: string
  website: string
  bio: string

  // Step 4: Effort Configuration
  primaryLanguage: string
  logo: File | null
  primaryColor: string
  secondaryColor: string
  tagline: string
  helpRequestCategories: string[]
  resourceTypes: string[]
  publicVisibility: boolean
}

const initialFormData: FormData = {
  disasterName: '',
  disasterType: DisasterType.OTHER,
  disasterDate: '',
  expectedDuration: '',
  description: '',
  affectedArea: null,
  primaryCity: '',
  radius: 0,
  organizationName: '',
  organizationType: OrganizationType.INDIVIDUAL,
  taxId: '',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  secondaryContactName: '',
  secondaryContactEmail: '',
  secondaryContactPhone: '',
  website: '',
  bio: '',
  primaryLanguage: 'en',
  logo: null,
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  tagline: '',
  helpRequestCategories: [],
  resourceTypes: [],
  publicVisibility: true
}

const steps = [
  { id: 1, title: 'Disaster Information', description: 'Tell us about the disaster' },
  { id: 2, title: 'Geographic Scope', description: 'Define the affected area' },
  { id: 3, title: 'Organizer Information', description: 'About your organization' },
  { id: 4, title: 'Effort Configuration', description: 'Customize your effort' },
  { id: 5, title: 'Review & Submit', description: 'Review and submit for approval' }
]

export default function CreateEffortPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const isStepValid = (step: number) => {
    if (step === 1) {
      return (
        formData.disasterName.trim().length > 0 &&
        String(formData.disasterType).length > 0 &&
        formData.disasterDate.trim().length > 0 &&
        formData.description.trim().length > 0
      )
    }
    if (step === 2) {
      return formData.primaryCity.trim().length > 0
    }
    if (step === 3) {
      return (
        formData.organizationName.trim().length > 0 &&
        String(formData.organizationType).length > 0 &&
        formData.primaryContactName.trim().length > 0 &&
        formData.primaryContactEmail.trim().length > 0 &&
        formData.primaryContactPhone.trim().length > 0 &&
        formData.bio.trim().length > 0
      )
    }
    if (step === 4) {
      return formData.primaryLanguage.trim().length > 0
    }
    return true
  }

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/efforts/create')
    return null
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      // Shape payload to match API expectations
      const payload = {
        name: formData.disasterName || `${formData.organizationName} Relief`,
        description: formData.description || undefined,
        disasterType: formData.disasterType,
        affectedArea:
          formData.affectedArea ?? {
            type: 'Polygon' as const,
            coordinates: [
              [
                [0, 0],
                [0.01, 0],
                [0.01, 0.01],
                [0, 0.01],
                [0, 0],
              ],
            ],
          },
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        primaryContactName: formData.primaryContactName,
        primaryContactEmail: formData.primaryContactEmail,
        primaryContactPhone: formData.primaryContactPhone,
        primaryLanguage: formData.primaryLanguage || 'en',
        timezone: 'UTC',
      }

      const response = await fetch('/api/efforts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/efforts/${result.data.slug}?created=true`)
      } else {
        // Show error details from API (including Zod errors)
        let message = result.error || 'Failed to create effort.'
        if (result.details && Array.isArray(result.details)) {
          message += ':\n' + result.details.map((d: any) => d.message).join('\n')
        }
        setApiError(message)
        console.error('Error creating effort:', result.error, result.details)
      }
    } catch (error) {
      setApiError('Unexpected error')
      console.error('Error creating effort:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start a Relief Effort
          </h1>
          <p className="text-gray-600">
            Help coordinate disaster response in your community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="hidden md:flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center space-x-2 text-sm",
                currentStep >= step.id ? "text-primary" : "text-gray-400"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                currentStep >= step.id ? "bg-primary text-white" : "bg-gray-200"
              )}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div>
                <div className="font-medium">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-emergency" />
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disaster Name *
                  </label>
                  <Input
                    value={formData.disasterName}
                    onChange={(e) => updateFormData({ disasterName: e.target.value })}
                    placeholder="e.g., Hurricane Helene Response"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disaster Type *
                  </label>
                  <Select
                    value={formData.disasterType}
                    onValueChange={(value) => updateFormData({ disasterType: value as DisasterType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HURRICANE">Hurricane</SelectItem>
                      <SelectItem value="FLOOD">Flood</SelectItem>
                      <SelectItem value="WILDFIRE">Wildfire</SelectItem>
                      <SelectItem value="EARTHQUAKE">Earthquake</SelectItem>
                      <SelectItem value="TORNADO">Tornado</SelectItem>
                      <SelectItem value="DROUGHT">Drought</SelectItem>
                      <SelectItem value="PANDEMIC">Pandemic</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Occurred *
                    </label>
                    <Input
                      type="date"
                      value={formData.disasterDate}
                      onChange={(e) => updateFormData({ disasterDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Duration
                    </label>
                    <Select
                      value={formData.expectedDuration}
                      onValueChange={(value) => updateFormData({ expectedDuration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-week">1 week</SelectItem>
                        <SelectItem value="1-month">1 month</SelectItem>
                        <SelectItem value="3-months">3 months</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Brief description of the disaster and its impact..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">
                        Geographic Scope
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Define the area affected by the disaster. This helps volunteers and resources find your effort.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary City/Region *
                  </label>
                  <Input
                    value={formData.primaryCity}
                    onChange={(e) => updateFormData({ primaryCity: e.target.value })}
                    placeholder="e.g., Mumbai, Maharashtra, IN"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affected Area Radius (km)
                  </label>
                  <Input
                    type="number"
                    value={formData.radius}
                    onChange={(e) => updateFormData({ radius: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 50"
                    min="0"
                  />
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-sm text-gray-600">
                    Map integration will be added here to allow drawing the affected area polygon.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) => updateFormData({ organizationName: e.target.value })}
                    placeholder="e.g., Miami Community Relief"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Type *
                  </label>
                  <Select
                    value={formData.organizationType}
                    onValueChange={(value) => updateFormData({ organizationType: value as OrganizationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONPROFIT">Nonprofit Organization</SelectItem>
                      <SelectItem value="GOVERNMENT">Government Agency</SelectItem>
                      <SelectItem value="FAITH_BASED">Faith-Based Organization</SelectItem>
                      <SelectItem value="COMMUNITY_GROUP">Community Group</SelectItem>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID (Optional)
                    </label>
                    <Input
                      value={formData.taxId}
                      onChange={(e) => updateFormData({ taxId: e.target.value })}
                      placeholder="EIN or Tax ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Contact Name *
                  </label>
                  <Input
                    value={formData.primaryContactName}
                    onChange={(e) => updateFormData({ primaryContactName: e.target.value })}
                    placeholder="Your full name"
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.primaryContactEmail}
                      onChange={(e) => updateFormData({ primaryContactEmail: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Phone *
                    </label>
                    <Input
                      type="tel"
                      value={formData.primaryContactPhone}
                      onChange={(e) => updateFormData({ primaryContactPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Bio *
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => updateFormData({ bio: e.target.value })}
                    placeholder="Tell us about your organization and why you're qualified to organize this relief effort..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Language
                  </label>
                  <Select
                    value={formData.primaryLanguage}
                    onValueChange={(value) => updateFormData({ primaryLanguage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effort Tagline
                  </label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => updateFormData({ tagline: e.target.value })}
                    placeholder="A short, inspiring tagline for your effort"
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Help Request Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['SHELTER', 'FOOD', 'WATER', 'MEDICAL', 'EVACUATION', 'SUPPLIES', 'TRANSPORTATION', 'COMMUNICATION', 'OTHER'].map((category) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.helpRequestCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData({
                                helpRequestCategories: [...formData.helpRequestCategories, category]
                              })
                            } else {
                              updateFormData({
                                helpRequestCategories: formData.helpRequestCategories.filter(c => c !== category)
                              })
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          {category.charAt(0) + category.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-green-900">
                        Ready to Submit
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Review your information below and submit for verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Disaster Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>Name:</strong> {formData.disasterName}</p>
                      <p><strong>Type:</strong> {formData.disasterType}</p>
                      <p><strong>Date:</strong> {formData.disasterDate}</p>
                      <p><strong>Description:</strong> {formData.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Organization
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>Name:</strong> {formData.organizationName}</p>
                      <p><strong>Type:</strong> {formData.organizationType}</p>
                      <p><strong>Contact:</strong> {formData.primaryContactName}</p>
                      <p><strong>Email:</strong> {formData.primaryContactEmail}</p>
                      <p><strong>Phone:</strong> {formData.primaryContactPhone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Configuration
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>Language:</strong> {formData.primaryLanguage}</p>
                      <p><strong>Tagline:</strong> {formData.tagline}</p>
                      <p><strong>Categories:</strong> {formData.helpRequestCategories.join(', ')}</p>
                    </div>
                  </div>
                </div>
                {apiError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mt-4">
                    {apiError}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/efforts')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-emergency hover:bg-emergency-dark"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <span>Submit for Approval</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
