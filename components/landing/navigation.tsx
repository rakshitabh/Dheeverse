"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useState } from "react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">DheeVerse</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="#about" className="text-foreground hover:text-primary transition">
              About
            </Link>
            <Link href="#features" className="text-foreground hover:text-primary transition">
              Features
            </Link>
            <Link href="#reviews" className="text-foreground hover:text-primary transition">
              Reviews
            </Link>
            <Link href="#contact" className="text-foreground hover:text-primary transition">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-foreground hover:text-primary transition">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="#home" className="block text-foreground hover:text-primary">
              Home
            </Link>
            <Link href="#about" className="block text-foreground hover:text-primary">
              About
            </Link>
            <Link href="#features" className="block text-foreground hover:text-primary">
              Features
            </Link>
            <Link href="#reviews" className="block text-foreground hover:text-primary">
              Reviews
            </Link>
            <Link href="#contact" className="block text-foreground hover:text-primary">
              Contact
            </Link>
            <div className="pt-2 space-y-2">
              <Link href="/login" className="block text-foreground hover:text-primary">
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-primary text-primary-foreground px-4 py-2 rounded-full text-center font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
