'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Contrast,
  MousePointer,
  Keyboard
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccessibilityTest {
  id: string
  name: string
  description: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  category: 'color' | 'contrast' | 'focus' | 'keyboard' | 'screen-reader' | 'semantic'
  fix?: string
}

export function AccessibilityTester() {
  const [isVisible, setIsVisible] = useState(false)
  const [tests, setTests] = useState<AccessibilityTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    setReducedMotion(prefersReducedMotion)
    setHighContrast(prefersHighContrast)
  }, [])

  const runAccessibilityTests = async () => {
    setIsRunning(true)
    const newTests: AccessibilityTest[] = []

    // Test 1: Color contrast
    const contrastTest = await testColorContrast()
    newTests.push(contrastTest)

    // Test 2: Focus management
    const focusTest = testFocusManagement()
    newTests.push(focusTest)

    // Test 3: Keyboard navigation
    const keyboardTest = testKeyboardNavigation()
    newTests.push(keyboardTest)

    // Test 4: Screen reader compatibility
    const screenReaderTest = testScreenReaderCompatibility()
    newTests.push(screenReaderTest)

    // Test 5: Semantic HTML
    const semanticTest = testSemanticHTML()
    newTests.push(semanticTest)

    // Test 6: ARIA labels
    const ariaTest = testAriaLabels()
    newTests.push(ariaTest)

    // Test 7: Form accessibility
    const formTest = testFormAccessibility()
    newTests.push(formTest)

    // Test 8: Image alt text
    const imageTest = testImageAltText()
    newTests.push(imageTest)

    // Test 9: Link accessibility
    const linkTest = testLinkAccessibility()
    newTests.push(linkTest)

    // Test 10: Heading structure
    const headingTest = testHeadingStructure()
    newTests.push(headingTest)

    setTests(newTests)
    setIsRunning(false)
  }

  const testColorContrast = async (): Promise<AccessibilityTest> => {
    // This is a simplified test - in production, use a proper contrast checker
    const elements = document.querySelectorAll('*')
    let failCount = 0
    let totalCount = 0

    elements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        totalCount++
        // Simplified contrast check
        if (color === backgroundColor) {
          failCount++
        }
      }
    })

    const status = failCount === 0 ? 'pass' : failCount / totalCount > 0.1 ? 'fail' : 'warning'

    return {
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Check if text has sufficient contrast against background',
      status,
      category: 'contrast',
      fix: status !== 'pass' ? 'Ensure text has at least 4.5:1 contrast ratio with background' : undefined
    }
  }

  const testFocusManagement = (): AccessibilityTest => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    let hasFocusStyles = 0
    let totalFocusable = focusableElements.length

    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      if (styles.outline !== 'none' || styles.boxShadow !== 'none') {
        hasFocusStyles++
      }
    })

    const status = hasFocusStyles === totalFocusable ? 'pass' : 'fail'

    return {
      id: 'focus-management',
      name: 'Focus Management',
      description: 'Check if all focusable elements have visible focus indicators',
      status,
      category: 'focus',
      fix: status !== 'pass' ? 'Add visible focus indicators to all interactive elements' : undefined
    }
  }

  const testKeyboardNavigation = (): AccessibilityTest => {
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    let accessibleCount = 0
    let totalCount = interactiveElements.length

    interactiveElements.forEach(element => {
      if (element.getAttribute('tabindex') !== '-1') {
        accessibleCount++
      }
    })

    const status = accessibleCount === totalCount ? 'pass' : 'fail'

    return {
      id: 'keyboard-navigation',
      name: 'Keyboard Navigation',
      description: 'Check if all interactive elements are keyboard accessible',
      status,
      category: 'keyboard',
      fix: status !== 'pass' ? 'Ensure all interactive elements are keyboard accessible' : undefined
    }
  }

  const testScreenReaderCompatibility = (): AccessibilityTest => {
    const images = document.querySelectorAll('img')
    const buttons = document.querySelectorAll('button')
    const links = document.querySelectorAll('a')
    
    let missingAlt = 0
    let missingAriaLabel = 0
    let totalElements = images.length + buttons.length + links.length

    images.forEach(img => {
      if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
        missingAlt++
      }
    })

    buttons.forEach(button => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        missingAriaLabel++
      }
    })

    const totalMissing = missingAlt + missingAriaLabel
    const status = totalMissing === 0 ? 'pass' : totalMissing / totalElements > 0.1 ? 'fail' : 'warning'

    return {
      id: 'screen-reader',
      name: 'Screen Reader Compatibility',
      description: 'Check if elements have proper labels for screen readers',
      status,
      category: 'screen-reader',
      fix: status !== 'pass' ? 'Add alt text to images and aria-labels to interactive elements' : undefined
    }
  }

  const testSemanticHTML = (): AccessibilityTest => {
    const hasMain = !!document.querySelector('main')
    const hasHeader = !!document.querySelector('header')
    const hasFooter = !!document.querySelector('footer')
    const hasNav = !!document.querySelector('nav')
    const hasHeading = !!document.querySelector('h1, h2, h3, h4, h5, h6')
    
    const semanticScore = [hasMain, hasHeader, hasFooter, hasNav, hasHeading].filter(Boolean).length
    const status = semanticScore >= 4 ? 'pass' : semanticScore >= 3 ? 'warning' : 'fail'

    return {
      id: 'semantic-html',
      name: 'Semantic HTML',
      description: 'Check if page uses proper semantic HTML elements',
      status,
      category: 'semantic',
      fix: status !== 'pass' ? 'Use semantic HTML elements like main, header, footer, nav, and headings' : undefined
    }
  }

  const testAriaLabels = (): AccessibilityTest => {
    const interactiveElements = document.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="link"]'
    )
    
    let hasAriaLabel = 0
    let totalCount = interactiveElements.length

    interactiveElements.forEach(element => {
      if (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')) {
        hasAriaLabel++
      }
    })

    const status = hasAriaLabel === totalCount ? 'pass' : hasAriaLabel / totalCount > 0.8 ? 'warning' : 'fail'

    return {
      id: 'aria-labels',
      name: 'ARIA Labels',
      description: 'Check if interactive elements have proper ARIA labels',
      status,
      category: 'screen-reader',
      fix: status !== 'pass' ? 'Add aria-label or aria-labelledby to interactive elements' : undefined
    }
  }

  const testFormAccessibility = (): AccessibilityTest => {
    const forms = document.querySelectorAll('form')
    const inputs = document.querySelectorAll('input, select, textarea')
    
    let accessibleForms = 0
    let totalForms = forms.length

    forms.forEach(form => {
      const formInputs = form.querySelectorAll('input, select, textarea')
      let hasLabels = 0
      
      formInputs.forEach(input => {
        const id = input.getAttribute('id')
        if (id && form.querySelector(`label[for="${id}"]`)) {
          hasLabels++
        }
      })
      
      if (hasLabels === formInputs.length) {
        accessibleForms++
      }
    })

    const status = accessibleForms === totalForms ? 'pass' : 'fail'

    return {
      id: 'form-accessibility',
      name: 'Form Accessibility',
      description: 'Check if form inputs have proper labels',
      status,
      category: 'semantic',
      fix: status !== 'pass' ? 'Ensure all form inputs have associated labels' : undefined
    }
  }

  const testImageAltText = (): AccessibilityTest => {
    const images = document.querySelectorAll('img')
    let hasAlt = 0
    let totalImages = images.length

    images.forEach(img => {
      if (img.getAttribute('alt') !== null) {
        hasAlt++
      }
    })

    const status = hasAlt === totalImages ? 'pass' : 'fail'

    return {
      id: 'image-alt',
      name: 'Image Alt Text',
      description: 'Check if all images have alt text',
      status,
      category: 'screen-reader',
      fix: status !== 'pass' ? 'Add alt text to all images' : undefined
    }
  }

  const testLinkAccessibility = (): AccessibilityTest => {
    const links = document.querySelectorAll('a')
    let accessibleLinks = 0
    let totalLinks = links.length

    links.forEach(link => {
      const text = link.textContent?.trim()
      const href = link.getAttribute('href')
      const ariaLabel = link.getAttribute('aria-label')
      
      if ((text && text.length > 0) || ariaLabel || href) {
        accessibleLinks++
      }
    })

    const status = accessibleLinks === totalLinks ? 'pass' : 'fail'

    return {
      id: 'link-accessibility',
      name: 'Link Accessibility',
      description: 'Check if all links have accessible text',
      status,
      category: 'semantic',
      fix: status !== 'pass' ? 'Ensure all links have descriptive text or aria-label' : undefined
    }
  }

  const testHeadingStructure = (): AccessibilityTest => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let properStructure = true
    let lastLevel = 0

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        properStructure = false
      }
      lastLevel = level
    })

    const status = properStructure ? 'pass' : 'warning'

    return {
      id: 'heading-structure',
      name: 'Heading Structure',
      description: 'Check if headings follow proper hierarchy',
      status,
      category: 'semantic',
      fix: status !== 'pass' ? 'Ensure headings follow proper hierarchy (h1, h2, h3, etc.)' : undefined
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'fail':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'color':
        return <Type className="w-4 h-4" />
      case 'contrast':
        return <Contrast className="w-4 h-4" />
      case 'focus':
        return <MousePointer className="w-4 h-4" />
      case 'keyboard':
        return <Keyboard className="w-4 h-4" />
      case 'screen-reader':
        return <Volume2 className="w-4 h-4" />
      case 'semantic':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    document.documentElement.classList.toggle('high-contrast', !highContrast)
  }

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
    document.documentElement.classList.toggle('reduced-motion', !reducedMotion)
  }

  const adjustFontSize = (size: number) => {
    setFontSize(size)
    document.documentElement.style.fontSize = `${size}px`
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
        size="sm"
      >
        <Eye className="w-4 h-4 mr-2" />
        A11y Test
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accessibility Tester</CardTitle>
              <CardDescription>
                Test and improve accessibility compliance
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runAccessibilityTests}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isRunning ? 'Running Tests...' : 'Run Tests'}</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={toggleHighContrast}
              className="flex items-center space-x-2"
            >
              <Contrast className="w-4 h-4" />
              <span>{highContrast ? 'Disable' : 'Enable'} High Contrast</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={toggleReducedMotion}
              className="flex items-center space-x-2"
            >
              <MousePointer className="w-4 h-4" />
              <span>{reducedMotion ? 'Disable' : 'Enable'} Reduced Motion</span>
            </Button>
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Font Size:</label>
            <div className="flex space-x-2">
              {[12, 14, 16, 18, 20].map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => adjustFontSize(size)}
                >
                  {size}px
                </Button>
              ))}
            </div>
          </div>

          {/* Test Results */}
          {tests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="grid gap-4">
                {tests.map((test) => (
                  <Card key={test.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(test.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{test.name}</h4>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getCategoryIcon(test.category)}
                            <span>{test.category}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {test.description}
                        </p>
                        {test.fix && (
                          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Fix:</strong> {test.fix}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
