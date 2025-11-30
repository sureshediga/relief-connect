import Link from 'next/link'
import { Heart, MapPin, Users, Mail, Phone, Twitter, Facebook, Instagram } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Find Relief Efforts', href: '/efforts' },
      { name: 'Start an Effort', href: '/efforts/create' },
      { name: 'Volunteer', href: '/volunteer' },
      { name: 'Donate', href: '/donate' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Guidelines', href: '/safety' },
      { name: 'Templates & Playbooks', href: '/resources' },
      { name: 'API Documentation', href: '/api-docs' },
      { name: 'Developer Resources', href: '/developers' },
    ],
    organization: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Partners', href: '/partners' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Careers', href: '/careers' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
      { name: 'Code of Conduct', href: '/code-of-conduct' },
    ],
  }

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Relief Connect</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Democratizing disaster response by providing professional-grade relief 
              coordination tools to any organization or community responding to a disaster.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@relief-connect.org</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>1-800-RELIEF-1</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Organization
            </h3>
            <ul className="space-y-3">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} Relief Connect. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-6 text-sm text-gray-400">
              <span>Built with ❤️ for communities in crisis</span>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Available globally</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-200">
                In an emergency?
              </h4>
              <p className="text-sm text-red-300 mt-1">
                If you're in immediate danger, call 911 or your local emergency services. 
                Relief Connect is a coordination platform, not an emergency response service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
