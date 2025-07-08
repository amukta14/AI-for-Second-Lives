"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Menu, X } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="https://www.walmart.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#0071CE"/>
            <g fill="#FFC220">
              <circle cx="16" cy="7" r="2"/>
              <circle cx="16" cy="25" r="2"/>
              <circle cx="7" cy="16" r="2"/>
              <circle cx="25" cy="16" r="2"/>
              <circle cx="10.93" cy="10.93" r="2"/>
              <circle cx="21.07" cy="21.07" r="2"/>
              <circle cx="10.93" cy="21.07" r="2"/>
              <circle cx="21.07" cy="10.93" r="2"/>
            </g>
          </svg>
          <span className="font-bold text-lg">Walmart</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-accent">Scan</Link>
            <Link href="/saved" className="transition-colors hover:text-accent">Saved</Link>
            <Link href="/submit" className="transition-colors hover:text-accent">Submit DIY</Link>
            <Link href="/local-recycling" className="transition-colors hover:text-accent">Recycling</Link>
          </nav>
          {/* Mobile Hamburger */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(v => !v)} aria-label="Open menu">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-primary text-white px-4 pb-4">
          <nav className="flex flex-col gap-4 text-base font-medium">
            <Link href="/" className="transition-colors hover:text-accent" onClick={() => setMenuOpen(false)}>Scan</Link>
            <Link href="/saved" className="transition-colors hover:text-accent" onClick={() => setMenuOpen(false)}>Saved</Link>
            <Link href="/submit" className="transition-colors hover:text-accent" onClick={() => setMenuOpen(false)}>Submit DIY</Link>
            <Link href="/local-recycling" className="transition-colors hover:text-accent" onClick={() => setMenuOpen(false)}>Recycling</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
