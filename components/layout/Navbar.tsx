'use client';

import Link from 'next/link';
import { Briefcase, Menu, X, LogOut, LayoutDashboard, Shield, Truck, User } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as 'customer' | 'driver' | 'admin' | undefined;
  const staffId = (session?.user as any)?.staffId as string | undefined;

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  // Determine dashboard link based on role
  const dashboardHref =
    role === 'admin' ? '/admin' : role === 'driver' ? '/driver' : '/dashboard';

  const dashboardLabel =
    role === 'admin' ? 'Admin' : role === 'driver' ? 'Driver Portal' : 'My Bookings';

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-green/5">
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
            {/* Public links */}
            {(!session || role === 'customer') && (
              <>
                <Link href="/booking/new" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                  Book pickup
                </Link>
                <Link href="/track" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                  Track luggage
                </Link>
              </>
            )}

            {/* Customer-only */}
            {session && role === 'customer' && (
              <Link href="/dashboard" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                My bookings
              </Link>
            )}

            {/* Admin-only */}
            {role === 'admin' && (
              <>
                <Link href="/admin" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                  Bookings
                </Link>
                <Link href="/admin/drivers" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                  Drivers
                </Link>
              </>
            )}

            {/* Driver-only */}
            {role === 'driver' && (
              <Link href="/driver" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                My Jobs
              </Link>
            )}

            {/* Guest-only */}
            {!session && (
              <Link href="/driver/login" className="text-sm font-medium text-brand-green hover:text-brand-orange transition-colors">
                For drivers
              </Link>
            )}
          </div>

          {/* Right side — Auth actions */}
          <div className="hidden items-center gap-4 lg:flex">
            {status === 'loading' ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-brand-green/10"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardHref}>
                  <Button variant="outline" size="sm" className="gap-2">
                    {role === 'admin' && <Shield className="h-4 w-4" />}
                    {role === 'driver' && <Truck className="h-4 w-4" />}
                    {role === 'customer' && <LayoutDashboard className="h-4 w-4" />}
                    {dashboardLabel}
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-brand-green" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Role badge (below navbar line) */}
        {session && role !== 'customer' && (
          <div className="hidden lg:flex items-center gap-2 pb-2 text-xs">
            <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 font-medium text-brand-orange uppercase tracking-wide">
              {role}
            </span>
            {staffId && <span className="font-mono text-brand-green/60">{staffId}</span>}
            <span className="text-brand-green/60">· {session.user?.name}</span>
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-brand-green/10 bg-brand-cream px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {(!session || role === 'customer') && (
              <>
                <Link href="/booking/new" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                  Book pickup
                </Link>
                <Link href="/track" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                  Track luggage
                </Link>
              </>
            )}

            {session && role === 'customer' && (
              <Link href="/dashboard" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                My bookings
              </Link>
            )}

            {role === 'admin' && (
              <>
                <Link href="/admin" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                  Bookings
                </Link>
                <Link href="/admin/drivers" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                  Drivers
                </Link>
              </>
            )}

            {role === 'driver' && (
              <Link href="/driver" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                My Jobs
              </Link>
            )}

            {!session && (
              <Link href="/driver/login" className="text-sm font-medium text-brand-green" onClick={() => setMobileOpen(false)}>
                For drivers
              </Link>
            )}

            <hr className="border-brand-green/10" />

            {session ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-brand-green/60" />
                  <span className="text-brand-green/70">{session.user?.name}</span>
                  {staffId && (
                    <span className="font-mono text-brand-green/60">({staffId})</span>
                  )}
                </div>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    {role === 'admin' && <Shield className="h-4 w-4" />}
                    {role === 'driver' && <Truck className="h-4 w-4" />}
                    {role === 'customer' && <LayoutDashboard className="h-4 w-4" />}
                    {dashboardLabel}
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={handleLogout} className="w-full gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}