"use client"

import { HeroSection } from "./hero-section"
import { LoginSection } from "./login-section"
import { FeaturesSection } from "./features-section"
import { ScreenshotsSection } from "./screenshots-section"
import { FooterSection } from "./footer-section"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Login Section */}
      <LoginSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Screenshots Section */}
      <ScreenshotsSection />
      
      {/* Footer Section */}
      <FooterSection />
    </div>
  )
}