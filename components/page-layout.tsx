"use client"

import type React from "react"

import { useState } from "react"
import { GlobalNavbar } from "@/components/global-navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AIChatbot } from "@/components/ai-chatbot"

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isMenuOpen={sidebarOpen} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => {}} />
      <main className="pt-14 md:ml-80 pb-20 md:pb-0 transition-all duration-300">{children}</main>
      <MobileNav />
      <ScrollToTop />
      <AIChatbot />
    </div>
  )
}
