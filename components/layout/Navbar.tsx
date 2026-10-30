'use client';

import Link from 'next/link';
import { Briefcase, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-brand-orange">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-brand-green tracking-tight">
              Luggage<span className="text-brand-orange">Ease</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link href="/booking/new" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">Book pickup</Link>
            <Link href="/track" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">Track luggage</Link>
            <Link href="/dashboard" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">My bookings</Link>
            <Link href="/driver" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">For drivers</Link>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/login" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
              Sign in
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-brand-green" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-brand-green/10 bg-brand-cream px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/booking/new" className="text-sm font-medium text-brand-green">Book pickup</Link>
            <Link href="/track" className="text-sm font-medium text-brand-green">Track luggage</Link>
            <Link href="/dashboard" className="text-sm font-medium text-brand-green">My bookings</Link>
            <Link href="/driver" className="text-sm font-medium text-brand-green">For drivers</Link>
            <hr className="border-brand-green/10" />
            <Link href="/login" className="text-sm font-medium text-brand-green">Sign in</Link>
          </div>
        </div>
      )}
    </nav>
  );
}