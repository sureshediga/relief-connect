'use client'

import { useState } from 'react'
import { 
  Plus, 
  Users, 
  Heart, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Shield,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  details: string[]
  estimatedTime: string
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps: Step[] = [
    {
      id: 1,
      title: 'Create Relief Effort',
      description: 'Set up your relief effort in minutes with our guided wizard',
      icon: Plus,
      color: 'text-emergency',
      bgColor: 'bg-emergency/10',
      details: [
        'Enter disaster information and location',
        'Provide organization details and contacts',
        'Configure effort settings and branding',
        'Submit for verification and approval'
      ],
      estimatedTime: '5 minutes'
    },
    {
      id: 2,
      title: 'Mobilize Volunteers',
      description: 'Recruit and coordinate volunteers with skills-based matching',
      icon: Users,
      color: 'text-urgent',
      bgColor: 'bg-urgent/10',
      details: [
        'Share volunteer registration link',
        'Collect skills and availability data',
        'Assign volunteers to specific tasks',
        'Track volunteer hours and performance'
      ],
      estimatedTime: '30 minutes'
    },
    {
      id: 3,
      title: 'Coordinate Resources',
      description: 'Manage donations and resources with real-time inventory',
      icon: Heart,
      color: 'text-success',
      bgColor: 'bg-success/10',
      details: [
        'Set up resource categories and needs',
        'Track incoming donations and supplies',
        'Distribute resources to those in need',
        'Monitor inventory levels and alerts'
      ],
      estimatedTime: '1 hour'
    },
    {
      id: 4,
      title: 'Communicate & Respond',
      description: 'Keep everyone informed and coordinate response efforts',
      icon: Phone,
      color: 'text-info',
      bgColor: 'bg-info/10',
      details: [
        'Send updates via SMS, email, and push notifications',
        'Manage help requests and assignments',
        'Coordinate with local authorities',
        'Provide real-time status updates'
      ],
      estimatedTime: 'Ongoing'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Relief Connect Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get your relief effort up and running in four simple steps. 
            Our platform handles the complexity so you can focus on helping people.
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-emergency to-success rounded-full transition-all duration-500"
                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300",
                    activeStep === index && "transform scale-105"
                  )}
                  onClick={() => setActiveStep(index)}
                >
                  {/* Step Circle */}
                  <div className={cn(
                    "w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300",
                    activeStep === index 
                      ? `${step.bgColor} shadow-lg` 
                      : "bg-gray-100"
                  )}>
                    <step.icon className={cn(
                      "w-12 h-12 transition-colors duration-300",
                      activeStep === index ? step.color : "text-gray-400"
                    )} />
                  </div>

                  {/* Step Number */}
                  <div className={cn(
                    "absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    activeStep === index 
                      ? "bg-emergency text-white" 
                      : "bg-gray-300 text-gray-600"
                  )}>
                    {step.id}
                  </div>

                  {/* Step Content */}
                  <div className="text-center">
                    <h3 className={cn(
                      "text-lg font-semibold mb-2 transition-colors duration-300",
                      activeStep === index ? "text-gray-900" : "text-gray-600"
                    )}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {step.description}
                    </p>
                    <div className="text-xs text-gray-400">
                      {step.estimatedTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Details */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {steps[activeStep].title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {steps[activeStep].description}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Estimated time: {steps[activeStep].estimatedTime}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {steps[activeStep].details.map((detail, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300",
                activeStep === index 
                  ? "border-primary" 
                  : "border-gray-200"
              )}
              onClick={() => setActiveStep(activeStep === index ? -1 : index)}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
                  activeStep === index ? step.bgColor : "bg-gray-100"
                )}>
                  <step.icon className={cn(
                    "w-8 h-8",
                    activeStep === index ? step.color : "text-gray-400"
                  )} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {step.estimatedTime}
                      </span>
                      <ArrowRight className={cn(
                        "w-4 h-4 text-gray-400 transition-transform duration-300",
                        activeStep === index && "rotate-90"
                      )} />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {activeStep === index && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-emergency to-urgent rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Your Relief Effort?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of organizations already using Relief Connect to coordinate disaster response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emergency hover:bg-gray-100"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Relief Effort
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-emergency"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Existing Efforts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
