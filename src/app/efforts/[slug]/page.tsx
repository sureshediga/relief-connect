import { notFound } from 'next/navigation';
import { EffortSubnav } from '@/components/efforts/effort-subnav'
import { EffortLocation } from '@/components/efforts/effort-location'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, Heart, HelpCircle, Camera, CheckCircle, Clock } from 'lucide-react'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Direct database query - more efficient than HTTP request
async function getEffort(slug: string) {
  try {
    const effort = await db.effort.findUnique({
      where: { slug },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            helpRequests: true,
            volunteers: true,
            donations: true,
            resources: true
          }
        }
      }
    });
    
    return effort;
  } catch (error) {
    console.error('Error fetching effort from database:', error);
    return null;
  }
}

// Direct database queries - much faster and more reliable
async function getEffortStats(effortId: string) {
  try {
    const [volunteers, resources, donations, helpRequests, media] = await Promise.all([
      db.volunteer.findMany({
        where: { effortId },
        select: { id: true, status: true }
      }),
      db.resource.findMany({
        where: { effortId },
        select: { id: true }
      }),
      db.donation.findMany({
        where: { effortId },
        select: { id: true, amount: true }
      }),
      db.helpRequest.findMany({
        where: { effortId },
        select: { id: true }
      }),
      db.media.findMany({
        where: { effortId },
        select: { id: true }
      })
    ]);

    return {
      totalVolunteers: volunteers.length,
      activeVolunteers: volunteers.filter(v => v.status === 'ACTIVE').length,
      totalResources: resources.length,
      totalDonations: donations.length,
      totalHelpRequests: helpRequests.length,
      totalMedia: media.length,
      totalDonationValue: donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    };
  } catch (error) {
    console.error('Error fetching effort stats:', error);
    return {
      totalVolunteers: 0,
      activeVolunteers: 0,
      totalResources: 0,
      totalDonations: 0,
      totalHelpRequests: 0,
      totalMedia: 0,
      totalDonationValue: 0
    };
  }
}

export default async function EffortDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 14+ requires awaiting params
  const { slug } = await params;
  
  const effort = await getEffort(slug);
  if (!effort) {
    notFound();
  }

  const stats = await getEffortStats(effort.id);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <EffortSubnav slug={effort.slug} />
      <div className="h-4" />
      <div className="mb-4">
        <a href="/efforts" className="text-blue-600 underline">&larr; Back to all efforts</a>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{effort.name}</h1>
      <p className="mb-6 text-gray-600">{effort.description}</p>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalVolunteers}</p>
                <p className="text-xs text-gray-600">Volunteers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeVolunteers}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalResources}</p>
                <p className="text-xs text-gray-600">Resources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalDonations}</p>
                <p className="text-xs text-gray-600">Donations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalHelpRequests}</p>
                <p className="text-xs text-gray-600">Help Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMedia}</p>
                <p className="text-xs text-gray-600">Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Effort Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Effort Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Disaster Type:</strong> {effort.disasterType}</div>
            <div><strong>Status:</strong> {effort.status}</div>
            <div><strong>Organization:</strong> {effort.organizationName}</div>
            <div><strong>Contact:</strong> {effort.primaryContactName}</div>
            <div><strong>Email:</strong> {effort.primaryContactEmail}</div>
            <div><strong>Phone:</strong> {effort.primaryContactPhone}</div>
            <div><strong>Language:</strong> {effort.primaryLanguage}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${stats.totalDonationValue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Donations Received</p>
            <div className="mt-4 text-sm">
              <div className="flex justify-between">
                <span>Number of Donations:</span>
                <span>{stats.totalDonations}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Donation:</span>
                <span>${stats.totalDonations > 0 ? (stats.totalDonationValue / stats.totalDonations).toFixed(2) : '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Section */}
      <EffortLocation 
        affectedArea={effort.affectedArea} 
        organizationName={effort.organizationName}
      />

      
    </div>
  );
}
