'use client'

import React from 'react'

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Coordinate Relief
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools necessary to run 
            an effective disaster relief operation, from initial setup to long-term recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Rapid Effort Creation
            </h3>
            <p className="text-gray-600">
              Launch a relief effort in minutes with our guided setup wizard
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Volunteer Management
            </h3>
            <p className="text-gray-600">
              Efficiently coordinate volunteers with skills-based matching
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Resource Inventory
            </h3>
            <p className="text-gray-600">
              Track donations and resources with real-time inventory management
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Multi-Channel Communication
            </h3>
            <p className="text-gray-600">
              Reach affected communities through SMS, email, and push notifications
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Mobile-First Design
            </h3>
            <p className="text-gray-600">
              Works seamlessly on any device, even with poor connectivity
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-Time Analytics
            </h3>
            <p className="text-gray-600">
              Make data-driven decisions with comprehensive reporting
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}