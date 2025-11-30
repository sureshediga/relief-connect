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
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  BarChart3
} from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'
import { ResourceType, ResourceStatus } from '@/types'
import { EffortSubnav } from '@/components/efforts/effort-subnav'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Resource {
  id: string
  name: string
  description: string
  type: ResourceType
  category: string
  quantity: number
  unit: string
  minQuantity: number
  maxQuantity: number
  status: ResourceStatus
  location: string
  supplier: string
  costPerUnit: number
  expiryDate?: string
  notes: string
  createdAt: string
  updatedAt: string
  donations: Array<{
    id: string
    quantity: number
    donorName: string
    donorEmail: string
    date: string
  }>
  distributions: Array<{
    id: string
    quantity: number
    recipientName: string
    recipientType: string
    date: string
    verified: boolean
  }>
}

function AddResourceForm({ effortSlug, onSuccess, onCancel }: { effortSlug: string, onSuccess: () => void, onCancel: () => void }) {
  const [form, setForm] = useState({
    name: '',
    type: ResourceType.FOOD,
    description: '',
    category: '',
    quantity: 1,
    unit: 'units',
    costPerUnit: 0,
    supplier: '',
    location: '',
    status: ResourceStatus.AVAILABLE,
    expiryDate: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/efforts/${encodeURIComponent(effortSlug)}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Failed to add resource')
        setLoading(false)
        return
      }
      onSuccess()
    } catch(err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
        <Select value={form.type} onValueChange={v => handleChange('type', v)}>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <Input value={form.category} onChange={e => handleChange('category', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
        <Input value={form.quantity} type="number" min={1} onChange={e => handleChange('quantity', Math.max(1, parseInt(e.target.value)||1))} required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
        <Input value={form.unit} onChange={e => handleChange('unit', e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit</label>
        <Input value={form.costPerUnit} type="number" min={0} onChange={e => handleChange('costPerUnit', parseFloat(e.target.value)||0)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
        <Input value={form.supplier} onChange={e => handleChange('supplier', e.target.value)} /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <Input value={form.location} onChange={e => handleChange('location', e.target.value)} /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
        <Select value={form.status} onValueChange={v => handleChange('status', v as ResourceStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ResourceStatus.AVAILABLE}>Available</SelectItem>
            <SelectItem value={ResourceStatus.RESERVED}>Reserved</SelectItem>
            <SelectItem value={ResourceStatus.DISTRIBUTED}>Distributed</SelectItem>
            <SelectItem value={ResourceStatus.EXPIRED}>Expired</SelectItem>
            <SelectItem value={ResourceStatus.DAMAGED}>Damaged</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
        <Input value={form.expiryDate} type="date" onChange={e => handleChange('expiryDate', e.target.value)} /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <Textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} />
      </div>
      {error && (<div className="text-red-600 text-sm">{error}</div>)}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Resource'}</Button>
      </DialogFooter>
    </form>
  )
}

export default function ResourcesManagementPage() {
  const params = useParams()
  const effortSlug = params.slug as string
  
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [effortSlug])

  const fetchResources = async () => {
    try {
      const response = await fetch(`/api/efforts/${effortSlug}/resources`)
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      
      const data = await response.json()
      setResources(data.resources)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case ResourceStatus.AVAILABLE:
        return 'bg-green-100 text-green-800'
      case ResourceStatus.RESERVED:
        return 'bg-yellow-100 text-yellow-800'
      case ResourceStatus.DISTRIBUTED:
        return 'bg-blue-100 text-blue-800'
      case ResourceStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800'
      case ResourceStatus.DAMAGED:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ResourceStatus) => {
    switch (status) {
      case ResourceStatus.AVAILABLE:
        return <CheckCircle className="w-4 h-4" />
      case ResourceStatus.RESERVED:
        return <Clock className="w-4 h-4" />
      case ResourceStatus.DISTRIBUTED:
        return <CheckCircle className="w-4 h-4" />
      case ResourceStatus.EXPIRED:
        return <Clock className="w-4 h-4" />
      case ResourceStatus.DAMAGED:
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || resource.type === typeFilter
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const lowStockResources = resources.filter(r => r.status === ResourceStatus.RESERVED || r.status === ResourceStatus.DISTRIBUTED)
  const totalValue = resources.reduce((sum, resource) => sum + (resource.quantity * resource.costPerUnit), 0)
  const totalItems = resources.reduce((sum, resource) => sum + resource.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
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
                Resource Inventory
              </h1>
              <p className="text-lg text-gray-600">
                Manage donations and resources for this relief effort
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
                  <AddResourceForm
                    effortSlug={effortSlug}
                    onSuccess={() => { fetchResources(); setShowAddForm(false); }}
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
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
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
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resources.filter(r => r.status === ResourceStatus.AVAILABLE).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockResources.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
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
        </div>

        {/* Low Stock Alert */}
        {lowStockResources.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-medium text-yellow-800">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {lowStockResources.length} items are running low or out of stock
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search resources..."
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ResourceStatus.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={ResourceStatus.RESERVED}>Reserved</SelectItem>
                  <SelectItem value={ResourceStatus.DISTRIBUTED}>Distributed</SelectItem>
                  <SelectItem value={ResourceStatus.EXPIRED}>Expired</SelectItem>
                  <SelectItem value={ResourceStatus.DAMAGED}>Damaged</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="justify-start">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No resources found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || typeFilter || statusFilter
                    ? 'Try adjusting your filters to see more resources.'
                    : 'No resources have been added to this effort yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">
                        {getTypeIcon(resource.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {resource.name}
                          </h3>
                          <Badge className={cn("flex items-center space-x-1", getStatusColor(resource.status))}>
                            {getStatusIcon(resource.status)}
                            <span>{resource.status}</span>
                          </Badge>
                          <Badge variant="outline">
                            {resource.type}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{resource.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <span className="ml-1 font-medium">
                              {resource.quantity} {resource.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-1 font-medium">{resource.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Value:</span>
                            <span className="ml-1 font-medium">
                              ${(resource.quantity * resource.costPerUnit).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Supplier:</span>
                            <span className="ml-1 font-medium">{resource.supplier}</span>
                          </div>
                        </div>
                        
                        {resource.expiryDate && (
                          <div className="mt-2 text-sm text-gray-500">
                            Expires: {new Date(resource.expiryDate).toLocaleDateString()}
                          </div>
                        )}
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
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
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
