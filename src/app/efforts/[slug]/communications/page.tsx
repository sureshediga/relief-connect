'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Smartphone, 
  Bell, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share
} from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'

interface Message {
  id: string
  title: string
  content: string
  type: 'SMS' | 'EMAIL' | 'PUSH' | 'BROADCAST'
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  recipients: {
    total: number
    sent: number
    delivered: number
    failed: number
  }
  scheduledFor?: string
  createdAt: string
  sentAt?: string
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
}

interface Template {
  id: string
  name: string
  type: 'SMS' | 'EMAIL' | 'PUSH'
  subject?: string
  content: string
  category: string
  createdAt: string
}

export default function CommunicationsPage() {
  const params = useParams()
  const effortSlug = params.slug as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'analytics'>('messages')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showComposeForm, setShowComposeForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [effortSlug])

  const fetchData = async () => {
    try {
      const [messagesRes, templatesRes] = await Promise.all([
        fetch(`/api/efforts/${effortSlug}/messages`),
        fetch(`/api/efforts/${effortSlug}/templates`)
      ])

      if (!messagesRes.ok || !templatesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [messagesData, templatesData] = await Promise.all([
        messagesRes.json(),
        templatesRes.json()
      ])

      setMessages(messagesData.messages)
      setTemplates(templatesData.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800'
      case 'SENDING':
        return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4" />
      case 'SENDING':
        return <Clock className="w-4 h-4" />
      case 'SCHEDULED':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4" />
      case 'DRAFT':
        return <Edit className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return <Smartphone className="w-4 h-4" />
      case 'EMAIL':
        return <Mail className="w-4 h-4" />
      case 'PUSH':
        return <Bell className="w-4 h-4" />
      case 'BROADCAST':
        return <Users className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800'
      case 'LOW':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || message.type === typeFilter
    const matchesStatus = !statusFilter || message.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const totalMessages = messages.length
  const sentMessages = messages.filter(m => m.status === 'SENT').length
  const scheduledMessages = messages.filter(m => m.status === 'SCHEDULED').length
  const totalRecipients = messages.reduce((sum, m) => sum + m.recipients.total, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Communication Center
              </h1>
              <p className="text-lg text-gray-600">
                Send messages and manage communications for this relief effort
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button onClick={() => setShowComposeForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{sentMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{scheduledMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRecipients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'messages', name: 'Messages', icon: MessageSquare },
                { id: 'templates', name: 'Templates', icon: Mail },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PUSH">Push Notification</SelectItem>
                      <SelectItem value="BROADCAST">Broadcast</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="SENDING">Sending</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="justify-start">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages List */}
            <div className="space-y-4">
              {filteredMessages.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No messages found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || typeFilter || statusFilter
                        ? 'Try adjusting your filters to see more messages.'
                        : 'No messages have been sent yet.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredMessages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(message.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {message.title}
                              </h3>
                              <Badge className={cn("flex items-center space-x-1", getStatusColor(message.status))}>
                                {getStatusIcon(message.status)}
                                <span>{message.status}</span>
                              </Badge>
                              <Badge className={cn("flex items-center space-x-1", getPriorityColor(message.priority))}>
                                <span>{message.priority}</span>
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {message.content}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Type:</span> {message.type}
                              </div>
                              <div>
                                <span className="font-medium">Recipients:</span> {message.recipients.total}
                              </div>
                              <div>
                                <span className="font-medium">Delivered:</span> {message.recipients.delivered}
                              </div>
                              <div>
                                <span className="font-medium">Failed:</span> {message.recipients.failed}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                              <span>Created by {message.createdBy.name}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(new Date(message.createdAt))}</span>
                              {message.sentAt && (
                                <>
                                  <span>•</span>
                                  <span>Sent {formatTimeAgo(new Date(message.sentAt))}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Message Templates</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <CardDescription>{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {template.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Created {formatTimeAgo(new Date(template.createdAt))}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Communication Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {((sentMessages / totalMessages) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Delivery Rate</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {totalRecipients}
                    </div>
                    <div className="text-sm text-gray-600">Total Reach</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {messages.filter(m => m.type === 'SMS').length}
                    </div>
                    <div className="text-sm text-gray-600">SMS Messages</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {messages.filter(m => m.type === 'EMAIL').length}
                    </div>
                    <div className="text-sm text-gray-600">Email Messages</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
