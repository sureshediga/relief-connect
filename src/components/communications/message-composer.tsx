'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Mail, 
  Smartphone, 
  Bell, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  isOpen: boolean
  onClose: () => void
  onSend: (message: any) => void
  effortId: string
}

interface RecipientGroup {
  id: string
  name: string
  type: 'VOLUNTEERS' | 'DONORS' | 'AFFECTED_PEOPLE' | 'CUSTOM'
  count: number
  selected: boolean
}

const RECIPIENT_GROUPS: RecipientGroup[] = [
  { id: 'volunteers', name: 'All Volunteers', type: 'VOLUNTEERS', count: 0, selected: false },
  { id: 'donors', name: 'All Donors', type: 'DONORS', count: 0, selected: false },
  { id: 'affected', name: 'Affected People', type: 'AFFECTED_PEOPLE', count: 0, selected: false },
  { id: 'custom', name: 'Custom List', type: 'CUSTOM', count: 0, selected: false }
]

export function MessageComposer({ isOpen, onClose, onSend, effortId }: MessageComposerProps) {
  const [step, setStep] = useState(1)
  const [messageType, setMessageType] = useState<'SMS' | 'EMAIL' | 'PUSH' | 'BROADCAST'>('EMAIL')
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>(RECIPIENT_GROUPS)
  const [customRecipients, setCustomRecipients] = useState<string[]>([''])
  const [scheduledFor, setScheduledFor] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRecipientToggle = (groupId: string) => {
    setRecipientGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, selected: !group.selected }
          : group
      )
    )
  }

  const handleCustomRecipientChange = (index: number, value: string) => {
    setCustomRecipients(prev => 
      prev.map((recipient, i) => i === index ? value : recipient)
    )
  }

  const addCustomRecipient = () => {
    setCustomRecipients(prev => [...prev, ''])
  }

  const removeCustomRecipient = (index: number) => {
    setCustomRecipients(prev => prev.filter((_, i) => i !== index))
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
        return <Mail className="w-4 h-4" />
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

  const getTotalRecipients = () => {
    const selectedGroups = recipientGroups.filter(g => g.selected)
    const customCount = customRecipients.filter(r => r.trim()).length
    return selectedGroups.reduce((sum, group) => sum + group.count, 0) + customCount
  }

  const handleSend = async () => {
    setLoading(true)
    setError('')

    try {
      const selectedGroups = recipientGroups.filter(g => g.selected)
      const customEmails = customRecipients.filter(r => r.trim())

      const messageData = {
        title,
        content,
        type: messageType,
        priority,
        subject: messageType === 'EMAIL' ? subject : undefined,
        recipientGroups: selectedGroups.map(g => g.type),
        customRecipients: customEmails,
        scheduledFor: isScheduled ? scheduledFor : undefined,
        effortId
      }

      const response = await fetch(`/api/efforts/${effortId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      onSend(messageData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>
                Send a message to volunteers, donors, or affected people
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Step 1: Message Type and Priority */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Message Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'EMAIL', label: 'Email', icon: Mail },
                    { type: 'SMS', label: 'SMS', icon: Smartphone },
                    { type: 'PUSH', label: 'Push Notification', icon: Bell },
                    { type: 'BROADCAST', label: 'Broadcast', icon: Users }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setMessageType(type as any)}
                      className={cn(
                        "p-4 border rounded-lg text-left transition-colors",
                        messageType === type
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority Level
                </label>
                <div className="flex space-x-2">
                  {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setPriority(level as any)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        priority === level
                          ? getPriorityColor(level)
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter message title"
                />
              </div>

              {messageType === 'EMAIL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your message content..."
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {messageType === 'SMS' && `${content.length}/160 characters`}
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Previous
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Recipients */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Recipients
                </label>
                <div className="space-y-3">
                  {recipientGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={group.selected}
                          onCheckedChange={() => handleRecipientToggle(group.id)}
                        />
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-gray-500">
                            {group.count} recipients
                          </p>
                        </div>
                      </div>
                      {group.selected && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Custom Recipients
                </label>
                <div className="space-y-2">
                  {customRecipients.map((recipient, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={recipient}
                        onChange={(e) => handleCustomRecipientChange(index, e.target.value)}
                        placeholder="Enter email or phone number"
                        type={messageType === 'SMS' ? 'tel' : 'email'}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomRecipient(index)}
                        disabled={customRecipients.length === 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomRecipient}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Recipient
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Recipients:</span>
                  <span className="text-lg font-bold text-primary">
                    {getTotalRecipients()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Previous
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule and Send */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={(checked) => setIsScheduled(checked === true)}
                  />
                  <label htmlFor="schedule" className="text-sm font-medium text-gray-700">
                    Schedule for later
                  </label>
                </div>
                {isScheduled && (
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Message Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(messageType)}
                    <span className="font-medium">Type:</span>
                    <span>{messageType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Priority:</span>
                    <Badge className={getPriorityColor(priority)}>
                      {priority}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Title:</span>
                    <span>{title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Recipients:</span>
                    <span>{getTotalRecipients()}</span>
                  </div>
                  {isScheduled && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Scheduled for:</span>
                      <span>{new Date(scheduledFor).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Previous
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !title || !content}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {isScheduled ? 'Schedule Message' : 'Send Message'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
