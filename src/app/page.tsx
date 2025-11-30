import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { StatsSection } from '@/components/home/stats-section'
import { CTASection } from '@/components/home/cta-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </div>
  )
}
