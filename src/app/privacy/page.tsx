'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Lock, 
  Database, 
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivacyRights {
  id: string
  name: string
  description: string
  status: 'available' | 'pending' | 'unavailable'
  action: string
}

interface DataCategory {
  id: string
  name: string
  description: string
  retentionPeriod: string
  purpose: string
  legalBasis: string
}

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rights' | 'data' | 'settings'>('overview')
  const [consentGiven, setConsentGiven] = useState(true)
  const [dataProcessing, setDataProcessing] = useState(true)
  const [marketing, setMarketing] = useState(false)

  const privacyRights: PrivacyRights[] = [
    {
      id: 'access',
      name: 'Right to Access',
      description: 'Request a copy of all personal data we hold about you',
      status: 'available',
      action: 'Download Data'
    },
    {
      id: 'rectification',
      name: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete personal data',
      status: 'available',
      action: 'Update Data'
    },
    {
      id: 'erasure',
      name: 'Right to Erasure',
      description: 'Request deletion of your personal data',
      status: 'available',
      action: 'Delete Data'
    },
    {
      id: 'portability',
      name: 'Right to Data Portability',
      description: 'Receive your data in a structured, machine-readable format',
      status: 'available',
      action: 'Export Data'
    },
    {
      id: 'restriction',
      name: 'Right to Restrict Processing',
      description: 'Limit how we process your personal data',
      status: 'available',
      action: 'Restrict Processing'
    },
    {
      id: 'objection',
      name: 'Right to Object',
      description: 'Object to processing of your personal data',
      status: 'available',
      action: 'Object to Processing'
    }
  ]

  const dataCategories: DataCategory[] = [
    {
      id: 'personal',
      name: 'Personal Information',
      description: 'Name, email, phone number, address',
      retentionPeriod: '7 years',
      purpose: 'Account management and communication',
      legalBasis: 'Contract performance and legitimate interest'
    },
    {
      id: 'volunteer',
      name: 'Volunteer Information',
      description: 'Skills, availability, background check status',
      retentionPeriod: '5 years',
      purpose: 'Volunteer coordination and safety',
      legalBasis: 'Contract performance and legitimate interest'
    },
    {
      id: 'help-requests',
      name: 'Help Request Data',
      description: 'Request details, location, urgency level',
      retentionPeriod: '5 years',
      purpose: 'Disaster relief coordination',
      legalBasis: 'Vital interests and legitimate interest'
    },
    {
      id: 'communications',
      name: 'Communication Data',
      description: 'Messages, notifications, email history',
      retentionPeriod: '2 years',
      purpose: 'Service delivery and support',
      legalBasis: 'Contract performance'
    },
    {
      id: 'analytics',
      name: 'Analytics Data',
      description: 'Usage patterns, performance metrics',
      retentionPeriod: '3 years',
      purpose: 'Service improvement and optimization',
      legalBasis: 'Legitimate interest'
    },
    {
      id: 'cookies',
      name: 'Cookie Data',
      description: 'Session information, preferences',
      retentionPeriod: '1 year',
      purpose: 'Website functionality and personalization',
      legalBasis: 'Consent'
    }
  ]

  const handleDataRequest = (rightId: string) => {
    // In production, this would trigger the appropriate data processing workflow
    console.log(`Processing data request: ${rightId}`)
  }

  const handleConsentUpdate = (type: string, value: boolean) => {
    // In production, this would update consent preferences
    console.log(`Updating consent for ${type}: ${value}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy & Data Protection
          </h1>
          <p className="text-lg text-gray-600">
            Manage your privacy settings and exercise your data rights
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Info },
                { id: 'rights', name: 'Your Rights', icon: Shield },
                { id: 'data', name: 'Data Categories', icon: Database },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Processing Consent</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Given
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Marketing Consent</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Not Given
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Sharing</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Restricted
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Data Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Personal Data Points</span>
                      <span className="font-semibold">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Categories</span>
                      <span className="font-semibold">6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="font-semibold">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retention Period</span>
                      <span className="font-semibold">7 years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common privacy-related actions you can take
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button className="h-auto p-4 flex flex-col items-start space-y-2">
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Download My Data</span>
                    <span className="text-xs text-gray-600">Get a copy of all your data</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                    <Edit className="w-5 h-5" />
                    <span className="font-medium">Update Information</span>
                    <span className="text-xs text-gray-600">Correct inaccurate data</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">Delete Account</span>
                    <span className="text-xs text-gray-600">Permanently remove all data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rights Tab */}
        {activeTab === 'rights' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Data Rights</CardTitle>
                <CardDescription>
                  Under GDPR and other privacy laws, you have specific rights regarding your personal data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {privacyRights.map((right) => (
                    <div key={right.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{right.name}</h3>
                          <Badge className={cn(
                            "flex items-center space-x-1",
                            right.status === 'available' 
                              ? "bg-green-100 text-green-800"
                              : right.status === 'pending'
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          )}>
                            {right.status === 'available' && <CheckCircle className="w-3 h-3" />}
                            {right.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                            <span>{right.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{right.description}</p>
                      </div>
                      <Button
                        onClick={() => handleDataRequest(right.id)}
                        disabled={right.status === 'unavailable'}
                        size="sm"
                      >
                        {right.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Categories Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Categories</CardTitle>
                <CardDescription>
                  Information about the types of data we collect and how we use it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataCategories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <Badge variant="outline">{category.retentionPeriod}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Purpose:</span>
                          <p className="text-gray-600">{category.purpose}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Legal Basis:</span>
                          <p className="text-gray-600">{category.legalBasis}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your data is processed and used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Data Processing</h3>
                      <p className="text-sm text-gray-600">
                        Allow us to process your data to provide our services
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dataProcessing}
                        onChange={(e) => {
                          setDataProcessing(e.target.checked)
                          handleConsentUpdate('dataProcessing', e.target.checked)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Marketing Communications</h3>
                      <p className="text-sm text-gray-600">
                        Receive updates about new features and disaster relief opportunities
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketing}
                        onChange={(e) => {
                          setMarketing(e.target.checked)
                          handleConsentUpdate('marketing', e.target.checked)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Analytics</h3>
                      <p className="text-sm text-gray-600">
                        Help us improve our services by sharing anonymous usage data
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => {
                          setConsentGiven(e.target.checked)
                          handleConsentUpdate('analytics', e.target.checked)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export & Deletion</CardTitle>
                <CardDescription>
                  Request your data or delete your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Export All Data</h3>
                      <p className="text-sm text-gray-600">
                        Download a complete copy of all your personal data
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Delete Account</h3>
                      <p className="text-sm text-gray-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
