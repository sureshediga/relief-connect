'use client'

import { forwardRef, useId } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AccessibleFormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  className?: string
  children: React.ReactNode
}

export function AccessibleFormField({
  label,
  error,
  required = false,
  description,
  className,
  children
}: AccessibleFormFieldProps) {
  const fieldId = useId()
  const errorId = useId()
  const descriptionId = useId()

  const hasError = !!error
  const describedBy = [description && descriptionId, error && errorId]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium",
          hasError && "text-red-600",
          required && "after:content-['*'] after:ml-1 after:text-red-500"
        )}
      >
        {label}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  )
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
  description?: string
  className?: string
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, required, description, className, ...props }, ref) => {
    const fieldId = useId()
    const errorId = useId()
    const descriptionId = useId()

    const hasError = !!error
    const describedBy = [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(' ')

    return (
      <AccessibleFormField
        label={label}
        error={error}
        required={required}
        description={description}
        className={className}
      >
        <Input
          ref={ref}
          id={fieldId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError}
          className={cn(
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          {...props}
        />
      </AccessibleFormField>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  required?: boolean
  description?: string
  className?: string
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, error, required, description, className, ...props }, ref) => {
    const fieldId = useId()
    const errorId = useId()
    const descriptionId = useId()

    const hasError = !!error
    const describedBy = [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(' ')

    return (
      <AccessibleFormField
        label={label}
        error={error}
        required={required}
        description={description}
        className={className}
      >
        <Textarea
          ref={ref}
          id={fieldId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError}
          className={cn(
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          {...props}
        />
      </AccessibleFormField>
    )
  }
)

AccessibleTextarea.displayName = 'AccessibleTextarea'

interface AccessibleSelectProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  className?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function AccessibleSelect({
  label,
  error,
  required,
  description,
  className,
  placeholder,
  value,
  onValueChange,
  children
}: AccessibleSelectProps) {
  const fieldId = useId()
  const errorId = useId()
  const descriptionId = useId()

  const hasError = !!error
  const describedBy = [description && descriptionId, error && errorId]
    .filter(Boolean)
    .join(' ')

  return (
    <AccessibleFormField
      label={label}
      error={error}
      required={required}
      description={description}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={fieldId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError}
          className={cn(
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </AccessibleFormField>
  )
}
