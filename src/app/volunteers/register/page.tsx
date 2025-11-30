'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Wrench,
  BookOpen,
  Car,
  Home,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VolunteerFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  
  // Location
  address: string
  city: string
  state: string
  zipCode: string
  canTravel: boolean
  maxTravelDistance: number
  
  // Skills and Availability
  skills: string[]
  experience: string
  availability: {
    weekdays: boolean
    weekends: boolean
    evenings: boolean
    nights: boolean
    holidays: boolean
  }
  preferredShifts: string[]
  
  // Background and Preferences
  backgroundCheck: boolean
  hasTransportation: boolean
  languages: string[]
  specialNeeds: string
  motivation: string
  
  // Effort Selection
  effortId: string
}

const SKILLS = [
  { id: 'medical', label: 'Medical/Healthcare', icon: Heart, color: 'bg-red-100 text-red-600' },
  { id: 'logistics', label: 'Logistics/Transportation', icon: Car, color: 'bg-blue-100 text-blue-600' },
  { id: 'construction', label: 'Construction/Repair', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
  { id: 'communication', label: 'Communication/Translation', icon: BookOpen, color: 'bg-green-100 text-green-600' },
  { id: 'counseling', label: 'Counseling/Support', icon: Star, color: 'bg-purple-100 text-purple-600' },
  { id: 'administration', label: 'Administration/Coordination', icon: Briefcase, color: 'bg-gray-100 text-gray-600' },
  { id: 'cooking', label: 'Food Service/Cooking', icon: Home, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'technology', label: 'Technology/IT Support', icon: Shield, color: 'bg-indigo-100 text-indigo-600' }
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
]

const SHIFT_TIMES = [
  'Early Morning (6AM-12PM)',
  'Afternoon (12PM-6PM)', 
  'Evening (6PM-12AM)',
  'Night (12AM-6AM)',
  'Flexible'
]

function VolunteerRegistrationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<VolunteerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    canTravel: false,
    maxTravelDistance: 0,
    skills: [],
    experience: 'beginner',
    availability: {
      weekdays: false,
      weekends: false,
      evenings: false,
      nights: false,
      holidays: false
    },
    preferredShifts: [],
    backgroundCheck: false,
    hasTransportation: true,
    languages: [],
    specialNeeds: '',
    motivation: '',
    effortId: ''
  })

  const isStepValid = (step: number) => {
    if (step === 1) {
      return (
        formData.firstName.trim().length > 0 &&
        formData.lastName.trim().length > 0 &&
        formData.email.trim().length > 0 &&
        formData.phone.trim().length > 0 &&
        formData.dateOfBirth.trim().length > 0 &&
        formData.emergencyContactName.trim().length > 0 &&
        formData.emergencyContactPhone.trim().length > 0 &&
        formData.emergencyContactRelation.trim().length > 0
      )
    }
    if (step === 2) {
      return (
        formData.address.trim().length > 0 &&
        formData.city.trim().length > 0 &&
        formData.state.trim().length > 0 &&
        formData.zipCode.trim().length > 0 &&
        (!formData.canTravel || formData.maxTravelDistance >= 0)
      )
    }
    if (step === 3) {
      return formData.experience.trim().length > 0
    }
    if (step === 5) {
      return formData.motivation.trim().length > 0
    }
    return true
  }

  // Prefill effortId from query (?effortId=) or from /efforts/[slug]/volunteer
  useEffect(() => {
    const qEffortId = searchParams?.get('effortId') || ''
    if (qEffortId && !formData.effortId) {
      setFormData(prev => ({ ...prev, effortId: qEffortId }))
      return
    }
    const slug = (params?.slug as string) || ''
    if (slug && !formData.effortId) {
      // Resolve slug -> id for prefill
      fetch(`/api/efforts?slug=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(data => {
          const id = data?.data?.[0]?.id
          if (id) setFormData(prev => ({ ...prev, effortId: id }))
        })
        .catch(() => {})
    }
  }, [searchParams, params])

  const steps = [
    { id: 1, title: 'Personal Info', description: 'Basic information' },
    { id: 2, title: 'Location', description: 'Address and travel' },
    { id: 3, title: 'Skills', description: 'Abilities and experience' },
    { id: 4, title: 'Availability', description: 'When you can help' },
    { id: 5, title: 'Background', description: 'Verification and preferences' },
    { id: 6, title: 'Review', description: 'Confirm details' }
  ]

  const handleInputChange = (field: keyof VolunteerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId]
    }))
  }

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const handleShiftToggle = (shift: string) => {
    setFormData(prev => ({
      ...prev,
      preferredShifts: prev.preferredShifts.includes(shift)
        ? prev.preferredShifts.filter(s => s !== shift)
        : [...prev.preferredShifts, shift]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to register as volunteer')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Thank you for volunteering. You'll receive a confirmation email shortly.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Volunteer Registration
          </h1>
          <p className="text-lg text-gray-600">
            Join our disaster relief efforts and make a difference in your community
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2",
                  currentStep >= step.id
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-gray-300 text-gray-500"
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-primary" : "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-4",
                    currentStep > step.id ? "bg-primary" : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name *
                      </label>
                      <Input
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship *
                      </label>
                      <Input
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                        placeholder="e.g., Spouse, Parent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="ZIP code"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Travel Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canTravel"
                        checked={formData.canTravel}
                        onCheckedChange={(checked) => handleInputChange('canTravel', checked)}
                      />
                      <label htmlFor="canTravel" className="text-sm font-medium text-gray-700">
                        I am willing to travel to help with relief efforts
                      </label>
                    </div>

                    {formData.canTravel && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Travel Distance (miles)
                        </label>
                        <Input
                          type="number"
                          value={formData.maxTravelDistance}
                          onChange={(e) => handleInputChange('maxTravelDistance', parseInt(e.target.value) || 0)}
                          placeholder="50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Select Your Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SKILLS.map((skill) => (
                      <div
                        key={skill.id}
                        className={cn(
                          "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                          formData.skills.includes(skill.id)
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleSkillToggle(skill.id)}
                      >
                        <skill.icon className={cn("w-5 h-5 mr-3", skill.color)} />
                        <span className="text-sm font-medium">{skill.label}</span>
                        {formData.skills.includes(skill.id) && (
                          <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LANGUAGES.map((language) => (
                      <Badge
                        key={language}
                        variant={formData.languages.includes(language) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleLanguageToggle(language)}
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Availability */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    When Are You Available?
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(formData.availability).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            handleInputChange('availability', {
                              ...formData.availability,
                              [key]: checked
                            })
                          }
                        />
                        <label htmlFor={key} className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Shift Times
                  </label>
                  <div className="space-y-2 mt-2">
                    {SHIFT_TIMES.map((shift) => (
                      <div key={shift} className="flex items-center space-x-2">
                        <Checkbox
                          id={shift}
                          checked={formData.preferredShifts.includes(shift)}
                          onCheckedChange={() => handleShiftToggle(shift)}
                        />
                        <label htmlFor={shift} className="text-sm text-gray-700">
                          {shift}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Background */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="backgroundCheck"
                      checked={formData.backgroundCheck}
                      onCheckedChange={(checked) => handleInputChange('backgroundCheck', checked)}
                    />
                    <label htmlFor="backgroundCheck" className="text-sm font-medium text-gray-700">
                      I consent to a background check
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasTransportation"
                      checked={formData.hasTransportation}
                      onCheckedChange={(checked) => handleInputChange('hasTransportation', checked)}
                    />
                    <label htmlFor="hasTransportation" className="text-sm font-medium text-gray-700">
                      I have reliable transportation
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Needs or Accommodations
                  </label>
                  <Textarea
                    value={formData.specialNeeds}
                    onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                    placeholder="Please describe any special needs or accommodations..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you want to volunteer? *
                  </label>
                  <Textarea
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="Tell us about your motivation to help..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Review Your Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{formData.city}, {formData.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skills:</span>
                      <span className="font-medium">{formData.skills.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Languages:</span>
                      <span className="font-medium">{formData.languages.length} selected</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll receive a confirmation email</li>
                    <li>• We'll review your application within 24 hours</li>
                    <li>• You'll be matched with suitable opportunities</li>
                    <li>• Training materials will be provided</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < steps.length ? (
                <Button onClick={nextStep} disabled={!isStepValid(currentStep)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VolunteerRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VolunteerRegistrationPageContent />
    </Suspense>
  )
}
