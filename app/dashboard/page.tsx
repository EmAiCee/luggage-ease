
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PayButton } from '@/components/booking/PayButton';
import { formatNaira } from '@/lib/pricing';
import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiTruck,
} from 'react-icons/fi';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  await connectDB();

  const bookings = await Booking.find({
    userId: (session.user as any).id,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-brand-green">
              Welcome, {session.user.name?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-brand-green/60">
              Manage your bookings and track luggage.
            </p>
          </div>

          <Link href="/booking/new">
            <Button>
              <span className="flex items-center gap-2">
                <FiPlus size={16} />
                New Booking
              </span>
            </Button>
          </Link>
        </div>

        {/* Bookings Section */}
        <h2 className="mt-12 font-serif text-2xl text-brand-green">
          Your Bookings
        </h2>

        {bookings.length === 0 ? (
          <Card className="mt-4 text-center text-brand-green/60">
            <div className="flex flex-col items-center gap-3 py-6">
              <FiPackage size={32} className="text-brand-green/40" />
              <p>No bookings yet.</p>
              <Link href="/booking/new">
                <Button>Make Your First Booking</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((b: any) => (
            <Link
                   href={`/dashboard/bookings/${b._id}`}
                    key={b._id.toString()}
              >
  <Card className="space-y-3 hover:border-brand-orange/30 transition-colors cursor-pointer">

                {/* Booking Information */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm font-semibold text-brand-green">
                      {b.reference}
                    </p>

                    <p className="flex items-center gap-1 text-xs text-brand-green/60">
                      <FiMapPin size={13} />
                      {b.pickup.city} → {b.destination?.city}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/60">
                      <FiPackage size={13} />
                      {formatNaira(b.price)} · {b.totalBags} bags · {b.totalWeight}kg
                    </p>
                  </div>

                  {/* Booking Status */}
                  <div className="text-right">
                    <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                      {b.status.replace('_', ' ')}
                    </span>

                    <p className="mt-2 flex items-center justify-end gap-1 text-xs text-brand-green/50">
                      {b.paymentStatus === 'paid' ? (
                        <>
                          <FiCheckCircle className="text-green-600" size={14} />
                          Paid
                        </>
                      ) : (
                        <>
                          <FiClock className="text-brand-orange" size={14} />
                          Unpaid
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Delivery OTP */}
                {b.paymentStatus === 'paid' && b.otp && (
                  <div className="rounded-lg bg-brand-green/5 p-3">
                    <p className="flex items-center gap-2 text-xs text-brand-green/60">
                      <FiTruck size={14} />
                      Delivery OTP (share with driver):
                    </p>

                    <p className="mt-1 font-mono text-lg font-bold text-brand-green">
                      {b.otp}
                    </p>
                  </div>
                )}

                {/* Payment Button */}
                {b.paymentStatus === 'unpaid' && (
                  <PayButton bookingId={b._id.toString()} />
                )}

               </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
