"use client"

import Link from "next/link"
import { Mail, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer id="contact" className="bg-background border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">DheeVerse</h3>
            <p className="text-sm text-muted-foreground">Build a healthier mind every day.</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#reviews" className="text-muted-foreground hover:text-primary transition">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-primary transition">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition">
                <Mail className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">© 2025 DheeVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
