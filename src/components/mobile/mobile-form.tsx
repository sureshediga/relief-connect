'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { TouchButton } from './touch-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: (value: string) => string | null
  showPassword?: boolean
}

interface MobileFormProps {
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  submitText?: string
  loading?: boolean
  error?: string
  className?: string
}

export function MobileForm({
  title,
  description,
  fields,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  error,
  className
}: MobileFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`
    }

    if (field.validation && value) {
      return field.validation(value)
    }

    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }))
  }

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id]
    const value = formData[field.id] || ''

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "h-12 text-base", // Larger touch target and text
                hasError && "border-red-500 focus:border-red-500"
              )}
            />
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors[field.id]}
              </p>
            )}
          </div>
        )

      case 'password':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <Input
                type={showPasswords[field.id] ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={cn(
                  "h-12 text-base pr-12", // Larger touch target and text
                  hasError && "border-red-500 focus:border-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field.id)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords[field.id] ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors[field.id]}
              </p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={cn(
                "text-base resize-none", // Larger text, no resize on mobile
                hasError && "border-red-500 focus:border-red-500"
              )}
            />
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors[field.id]}
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger className={cn(
                "h-12 text-base", // Larger touch target and text
                hasError && "border-red-500 focus:border-red-500"
              )}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors[field.id]}
              </p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-3">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => handleInputChange(field.id, checked)}
              className="mt-1"
            />
            <label htmlFor={field.id} className="text-sm font-medium text-gray-700 leading-5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {fields.map(renderField)}
          </div>

          <TouchButton
            fullWidth
            loading={loading}
            className="h-12 text-base font-medium"
          >
            {loading ? 'Submitting...' : submitText}
          </TouchButton>
        </form>
      </CardContent>
    </Card>
  )
}
