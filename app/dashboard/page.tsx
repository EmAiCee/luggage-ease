import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { Card } from '@/components/ui/Card';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  await connectDB();
  const bookings = await Booking.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-brand-green">
              Welcome, {session.user.name?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-brand-green/60">Manage your bookings and track luggage.</p>
          </div>
          <Link href="/booking/new">
            <Button>New Booking</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Package },
            { label: 'In Transit', value: bookings.filter(b => b.status === 'in_transit').length, icon: Truck },
            { label: 'Delivered', value: bookings.filter(b => b.status === 'delivered').length, icon: CheckCircle },
          ].map((s, i) => (
            <Card key={i} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/5">
                <s.icon className="h-6 w-6 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-green/60">{s.label}</p>
                <p className="text-2xl font-semibold text-brand-green">{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 font-serif text-2xl text-brand-green">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <Card className="mt-4 text-center text-brand-green/60">
            <Clock className="mx-auto h-10 w-10 text-brand-green/30" />
            <p className="mt-3">No bookings yet. Create your first one!</p>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((b: any) => (
              <Card key={b._id} className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-brand-green">{b.reference}</p>
                  <p className="text-xs text-brand-green/60">
                    {b.pickup.city} → {b.delivery.address}
                  </p>
                </div>
                <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                  {b.status}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}