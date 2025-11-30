"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpRequestType, UrgencyLevel } from "@/types"

export default function SubmitHelpRequestPage() {
  const [efforts, setEfforts] = useState<{ id: string, name: string }[]>([])
  const [form, setForm] = useState({
    effortId: '',
    type: HelpRequestType.OTHER,
    urgency: UrgencyLevel.ROUTINE,
    title: '',
    description: '',
    lat: '',
    lng: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    canText: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  useEffect(() => {
    fetch("/api/efforts?status=ACTIVE")
      .then((r) => r.json())
      .then((data) => {
        setEfforts((data?.data ?? []).map((e: any) => ({ id: e.id, name: e.name })))
      })
      .catch(() => setEfforts([]))
  }, [])
  const handleChange = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }))
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    if (!form.effortId || !form.type || !form.urgency || !form.title || !form.description || !form.contactName || !form.contactPhone || !form.lat || !form.lng) {
      setError("Please fill in all required fields.")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          effortId: form.effortId,
          type: form.type,
          urgency: form.urgency,
          title: form.title,
          description: form.description,
          location: { type: "Point", coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          canText: form.canText,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || "Submission failed")
      } else {
        setSuccess(true)
        setForm(f => ({ ...f, title: '', description: '', lat: '', lng: '', contactName: '', contactPhone: '', contactEmail: '', canText: false }))
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-2">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Submit Help Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {success && <div className="bg-green-100 text-green-800 rounded p-3 mb-2">Your request has been submitted! We'll follow up soon.</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relief Effort *</label>
              <Select value={form.effortId} onValueChange={v => handleChange('effortId', v)}>
                <SelectTrigger><SelectValue placeholder="Select an active effort" /></SelectTrigger>
                <SelectContent>
                  {efforts.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <Select value={form.type} onValueChange={v => handleChange('type', v as HelpRequestType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={HelpRequestType.SHELTER}>Shelter</SelectItem>
                  <SelectItem value={HelpRequestType.FOOD}>Food</SelectItem>
                  <SelectItem value={HelpRequestType.WATER}>Water</SelectItem>
                  <SelectItem value={HelpRequestType.MEDICAL}>Medical</SelectItem>
                  <SelectItem value={HelpRequestType.EVACUATION}>Evacuation</SelectItem>
                  <SelectItem value={HelpRequestType.SUPPLIES}>Supplies</SelectItem>
                  <SelectItem value={HelpRequestType.TRANSPORTATION}>Transportation</SelectItem>
                  <SelectItem value={HelpRequestType.COMMUNICATION}>Communication</SelectItem>
                  <SelectItem value={HelpRequestType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
              <Select value={form.urgency} onValueChange={v => handleChange('urgency', v as UrgencyLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UrgencyLevel.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={UrgencyLevel.URGENT}>Urgent</SelectItem>
                  <SelectItem value={UrgencyLevel.IMPORTANT}>Important</SelectItem>
                  <SelectItem value={UrgencyLevel.ROUTINE}>Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <Input value={form.title} onChange={e => handleChange('title', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <Textarea value={form.description} onChange={e => handleChange('description', e.target.value)} required rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
              <Input value={form.lat} onChange={e => handleChange('lat', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
              <Input value={form.lng} onChange={e => handleChange('lng', e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
              <Input value={form.contactName} onChange={e => handleChange('contactName', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
              <Input value={form.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <Input value={form.contactEmail} type="email" onChange={e => handleChange('contactEmail', e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <input id="canText" type="checkbox" checked={form.canText} onChange={(e) => handleChange('canText', e.target.checked)} />
              <label htmlFor="canText" className="text-sm text-gray-700">Can contact via text/SMS</label>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


