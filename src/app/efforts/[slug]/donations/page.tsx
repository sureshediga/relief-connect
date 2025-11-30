'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  Package,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Eye,
  Download
} from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'
import { ResourceType } from '@/types'
import { EffortSubnav } from '@/components/efforts/effort-subnav'

interface Donation {
  id: string
  resourceId: string
  resourceName: string
  resourceType: ResourceType
  quantity: number
  unit: string
  donorName: string
  donorEmail: string
  donorPhone?: string
  donorAddress?: string
  donorType: string
  value: number
  date: string
  status: 'PENDING' | 'RECEIVED' | 'VERIFIED' | 'DISTRIBUTED'
  notes: string
  verified: boolean
  verifiedAt?: string
  verifiedBy?: string
  createdAt: string
}

function RecordDonationForm({ effortSlug, onSuccess, onCancel }: { effortSlug: string, onSuccess: () => void, onCancel: () => void }) {
  const [form, setForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorAddress: '',
    donorType: 'Individual',
    resourceName: '',
    resourceType: ResourceType.FOOD,
    quantity: 1,
    unit: 'units',
    value: 0,
    notes: '',
    status: 'PENDING',
    date: new Date().toISOString().slice(0, 10),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }))
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/efforts/${encodeURIComponent(effortSlug)}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        let data = null; try { data = await res.json() } catch {}
        setError(data?.error || 'Failed to add donation')
        setLoading(false)
        return
      }
      onSuccess()
    } catch (err) { setError('Network error') }
    finally { setLoading(false) }
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
        <Input value={form.donorName} onChange={e => handleChange('donorName', e.target.value)} required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Donor Email *</label>
        <Input value={form.donorEmail} onChange={e => handleChange('donorEmail', e.target.value)} required type="email" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <Input value={form.donorPhone} onChange={e => handleChange('donorPhone', e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <Input value={form.donorAddress} onChange={e => handleChange('donorAddress', e.target.value)} /></div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Donor Type</label>
        <Select value={form.donorType} onValueChange={v => handleChange('donorType', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Individual">Individual</SelectItem>
            <SelectItem value="Organization">Organization</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
        <Input value={form.resourceName} onChange={e => handleChange('resourceName', e.target.value)} required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
        <Select value={form.resourceType} onValueChange={v => handleChange('resourceType', v as ResourceType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ResourceType.FOOD}>Food</SelectItem>
            <SelectItem value={ResourceType.WATER}>Water</SelectItem>
            <SelectItem value={ResourceType.SHELTER}>Shelter</SelectItem>
            <SelectItem value={ResourceType.MEDICAL}>Medical</SelectItem>
            <SelectItem value={ResourceType.CLOTHING}>Clothing</SelectItem>
            <SelectItem value={ResourceType.TOOLS}>Tools</SelectItem>
            <SelectItem value={ResourceType.FUEL}>Fuel</SelectItem>
            <SelectItem value={ResourceType.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
        <Input value={form.quantity} type="number" min={1} onChange={e => handleChange('quantity', Math.max(1, parseInt(e.target.value)||1))} required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
        <Input value={form.unit} onChange={e => handleChange('unit', e.target.value)} required /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (total)</label>
        <Input value={form.value} type="number" min={0} onChange={e => handleChange('value', parseFloat(e.target.value)||0)} /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <Textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select value={form.status} onValueChange={v => handleChange('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="DISTRIBUTED">Distributed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <Input value={form.date} onChange={e => handleChange('date', e.target.value)} type="date" /></div>
      </div>
      {error && (<div className="text-red-600 text-sm">{error}</div>)}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Record Donation'}</Button>
      </DialogFooter>
    </form>
  )
}

export default function DonationsPage() {
  const params = useParams()
  const effortSlug = params.slug as string
  
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchDonations()
  }, [effortSlug])

  const fetchDonations = async () => {
    try {
      const response = await fetch(`/api/efforts/${effortSlug}/donations`)
      if (!response.ok) {
        throw new Error('Failed to fetch donations')
      }
      
      const data = await response.json()
      setDonations(data.donations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'DISTRIBUTED':
        return 'bg-green-100 text-green-800'
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'DISTRIBUTED':
        return <CheckCircle className="w-4 h-4" />
      case 'RECEIVED':
        return <Package className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      default:
        return <Heart className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.FOOD:
        return '🍎'
      case ResourceType.WATER:
        return '💧'
      case ResourceType.SHELTER:
        return '🏠'
      case ResourceType.MEDICAL:
        return '🏥'
      case ResourceType.CLOTHING:
        return '👕'
      case ResourceType.TOOLS:
        return '🔧'
      case ResourceType.FUEL:
        return '⛽'
      case ResourceType.OTHER:
        return '📦'
      default:
        return '📦'
    }
  }

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.resourceName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter
    const matchesType = typeFilter === 'all' || donation.resourceType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalValue = donations.reduce((sum, donation) => sum + donation.value, 0)
  const totalItems = donations.reduce((sum, donation) => sum + donation.quantity, 0)
  const verifiedDonations = donations.filter(d => d.verified).length
  const pendingDonations = donations.filter(d => d.status === 'PENDING').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4"><EffortSubnav slug={effortSlug} /></div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Donation Tracking
              </h1>
              <p className="text-lg text-gray-600">
                Track and manage donations for this relief effort
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Record Donation
              </Button>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Donation</DialogTitle></DialogHeader>
                  <RecordDonationForm
                    effortSlug={effortSlug}
                    onSuccess={() => { fetchDonations(); setShowAddForm(false); }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{verifiedDonations}</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="DISTRIBUTED">Distributed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ResourceType.FOOD}>Food</SelectItem>
                  <SelectItem value={ResourceType.WATER}>Water</SelectItem>
                  <SelectItem value={ResourceType.SHELTER}>Shelter</SelectItem>
                  <SelectItem value={ResourceType.MEDICAL}>Medical</SelectItem>
                  <SelectItem value={ResourceType.CLOTHING}>Clothing</SelectItem>
                  <SelectItem value={ResourceType.TOOLS}>Tools</SelectItem>
                  <SelectItem value={ResourceType.FUEL}>Fuel</SelectItem>
                  <SelectItem value={ResourceType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="justify-start">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        <div className="space-y-4">
          {filteredDonations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No donations found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter || typeFilter
                    ? 'Try adjusting your filters to see more donations.'
                    : 'No donations have been recorded for this effort yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDonations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">
                        {getTypeIcon(donation.resourceType)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {donation.resourceName}
                          </h3>
                          <Badge className={cn("flex items-center space-x-1", getStatusColor(donation.status))}>
                            {getStatusIcon(donation.status)}
                            <span>{donation.status}</span>
                          </Badge>
                          <Badge variant="outline">
                            {donation.resourceType}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Donor Information</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>{donation.donorName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{donation.donorEmail}</span>
                              </div>
                              {donation.donorPhone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{donation.donorPhone}</span>
                                </div>
                              )}
                              {donation.donorAddress && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{donation.donorAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Donation Details</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Quantity:</span> {donation.quantity} {donation.unit}
                              </div>
                              <div>
                                <span className="font-medium">Value:</span> ${donation.value.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {donation.donorType}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(donation.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {donation.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {donation.notes}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                          <span>Recorded {formatTimeAgo(new Date(donation.createdAt))}</span>
                          {donation.verified && (
                            <>
                              <span>•</span>
                              <span>Verified {formatTimeAgo(new Date(donation.verifiedAt!))}</span>
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
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
