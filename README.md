# Relief Connect - Multi-Tenant Disaster Relief Platform

A comprehensive, democratized disaster relief coordination platform that enables organizations, communities, and grassroots organizers to rapidly deploy customized relief efforts for disasters.

## 🚀 Mission

Democratize disaster response by providing professional-grade relief coordination tools to any organization or community responding to a disaster, regardless of size or resources.

## ✨ Key Features

### 🏗️ Multi-Tenant Architecture
- **Effort Isolation**: Each relief effort operates as an independent instance
- **Subdomain Support**: `[effort-slug].platform.org` for each effort
- **Data Security**: Row-level security with PostgreSQL
- **Role-Based Access**: Granular permissions across efforts

### 🚨 Crisis-Optimized Design
- **Mobile-First**: Works on any device, even with poor connectivity
- **Progressive Web App**: Offline functionality and app-like experience
- **Accessibility**: WCAG 2.1 AA compliant for all users
- **High Contrast**: Optimized for emergency lighting conditions

### 🎯 Core Functionality
- **Effort Creation Wizard**: 5-step guided setup process
- **Volunteer Management**: Skills-based matching and scheduling
- **Resource Inventory**: Real-time tracking and distribution
- **Multi-Channel Communication**: SMS, email, push notifications
- **Real-Time Analytics**: Comprehensive reporting and insights
- **Interactive Maps**: GPS-powered location services

### 🌍 Global Scale
- **Multi-Language Support**: Built-in translation capabilities
- **Timezone Awareness**: Automatic timezone detection
- **Geographic Targeting**: Precise location-based features
- **Cultural Sensitivity**: Designed for diverse communities

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **React Query** - Server state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM with type safety
- **PostgreSQL** - Multi-tenant database
- **NextAuth.js** - Authentication and authorization

### Maps & Location
- **Mapbox GL** - Interactive mapping
- **React Map GL** - React integration
- **Leaflet** - Alternative mapping solution

### Communication
- **Twilio** - SMS and voice services
- **SendGrid** - Email delivery
- **WebSockets** - Real-time updates

### Storage & Media
- **AWS S3** - File and image storage
- **Sharp** - Image optimization
- **CloudFront** - CDN for global delivery

### Payments
- **Stripe** - Payment processing
- **Webhook handling** - Secure payment verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/relief-connect.git
   cd relief-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   - Database connection string
   - NextAuth secret
   - OAuth provider credentials
   - Map service API keys
   - Communication service credentials

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── efforts/           # Relief effort pages
│   ├── dashboard/         # User dashboard
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── home/             # Home page components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication config
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── styles/               # Additional styles
```

## 🔧 Configuration

### Environment Variables

See `env.example` for all required environment variables:

- **Database**: PostgreSQL connection string
- **Authentication**: NextAuth configuration
- **Maps**: Mapbox or Google Maps API keys
- **Communication**: Twilio and SendGrid credentials
- **Storage**: AWS S3 configuration
- **Payments**: Stripe keys

### Database Schema

The platform uses a multi-tenant architecture with:
- **Shared tables**: Users, accounts, sessions
- **Tenant-specific tables**: Efforts, help requests, resources
- **Row-level security**: Data isolation per effort
- **Audit trails**: Complete activity logging

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
docker build -t relief-connect .
docker run -p 3000:3000 relief-connect
```

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates

## 🔒 Security

### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete activity tracking
- **GDPR Compliance**: Privacy-first design

### Authentication
- **Multi-Factor**: Optional 2FA for organizers
- **Session Management**: Secure token handling
- **OAuth Integration**: Google, GitHub, etc.

## 📱 Mobile & PWA

### Progressive Web App
- **Offline Support**: Critical features work without internet
- **App Installation**: Install on home screen
- **Push Notifications**: Real-time alerts
- **Background Sync**: Data sync when online

### Mobile Optimization
- **Touch Targets**: Minimum 44x44px buttons
- **Responsive Design**: Works on all screen sizes
- **Performance**: <3 second load times
- **Accessibility**: Screen reader support

## 🌍 Internationalization

### Multi-Language Support
- **Built-in Translation**: Google Translate API integration
- **RTL Support**: Right-to-left language support
- **Cultural Adaptation**: Region-specific features
- **Localization**: Date, time, currency formatting

## 📊 Analytics & Monitoring

### Real-Time Metrics
- **Response Times**: Average time to first response
- **Volunteer Efficiency**: Hours and productivity tracking
- **Resource Utilization**: Donation and distribution metrics
- **Impact Measurement**: People helped, lives saved

### Platform Analytics
- **Usage Statistics**: Feature adoption and engagement
- **Performance Monitoring**: Response times and uptime
- **Error Tracking**: Automated error detection and reporting
- **User Feedback**: Continuous improvement insights

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Automated code linting
- **Prettier**: Code formatting
- **Testing**: Jest and React Testing Library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Developer Guide](docs/developer-guide.md)
- [Deployment Guide](docs/deployment.md)

### Community
- [Discord Server](https://discord.gg/relief-connect)
- [GitHub Discussions](https://github.com/your-org/relief-connect/discussions)
- [Email Support](mailto:support@relief-connect.org)

### Emergency Support
For critical issues during active disasters:
- **Email**: emergency@relief-connect.org
- **Phone**: 1-800-RELIEF-1
- **Response Time**: <2 hours during disasters

## 🙏 Acknowledgments

- **First Responders**: For their tireless work in disaster response
- **Open Source Community**: For the amazing tools and libraries
- **Beta Testers**: For their feedback and real-world testing
- **Contributors**: For making this platform better every day

## 📈 Roadmap

### Phase 1: MVP (Months 1-3) ✅
- [x] Basic effort creation and approval workflow
- [x] Public effort pages with help request forms
- [x] Simple organizer dashboard
- [x] Resource map with basic filtering
- [x] SMS and email integration
- [x] User authentication and basic roles

### Phase 2: Core Features (Months 4-6) 🚧
- [ ] Advanced organizer dashboard with analytics
- [ ] Volunteer management system
- [ ] Inter-effort coordination tools
- [ ] Template library
- [ ] Mobile PWA optimization
- [ ] Payment processing for donations

### Phase 3: Scale & Polish (Months 7-9) 📋
- [ ] Platform-wide analytics
- [ ] Resource sharing marketplace
- [ ] Advanced communication tools
- [ ] Accessibility compliance
- [ ] Performance optimization
- [ ] Security hardening

### Phase 4: Advanced Features (Months 10-12) 📋
- [ ] Custom domain mapping
- [ ] White-label options
- [ ] API for third-party integrations
- [ ] Mobile native apps
- [ ] AI-powered triage
- [ ] Multilingual support

---

**Remember**: This platform will be used during some of the worst moments of people's lives. Every line of code should be written with empathy, care, and the knowledge that your work might help save someone's life or reunite a family.

**Build for Humanity** ❤️
