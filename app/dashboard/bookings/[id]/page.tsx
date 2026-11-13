import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { Card } from '@/components/ui/Card';
import { formatNaira } from '@/lib/pricing';
import Link from 'next/link';
import {
  Package, MapPin, CheckCircle, Clock, Truck, User, FileCheck, CreditCard, ArrowLeft,
} from 'lucide-react';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  await connectDB();
  const booking: any = await Booking.findById(id)
    .populate('assignedDriver', 'name phone staffId')
    .lean();

  if (!booking) notFound();

  const isOwner = booking.userId.toString() === (session.user as any).id;
  if (!isOwner && (session.user as any).role !== 'admin') redirect('/dashboard');

  const timeline = [
    { label: 'Booking Created', date: booking.createdAt, done: true, icon: Package },
    { label: 'Payment Confirmed', date: booking.paidAt, done: booking.paymentStatus === 'paid', icon: CreditCard },
    {
      label: 'Driver Assigned',
      date: booking.status !== 'pending' && booking.status !== 'confirmed' ? booking.updatedAt : null,
      done: !!booking.assignedDriver,
      icon: User,
      detail: booking.assignedDriver?.name,
    },
    {
      label: 'Luggage Collected',
      date: ['collected', 'in_transit', 'delivered'].includes(booking.status) ? booking.updatedAt : null,
      done: ['collected', 'in_transit', 'delivered'].includes(booking.status),
      icon: Truck,
    },
    {
      label: 'In Transit',
      date: ['in_transit', 'delivered'].includes(booking.status) ? booking.updatedAt : null,
      done: ['in_transit', 'delivered'].includes(booking.status),
      icon: MapPin,
    },
    {
      label: 'Delivered',
      date: booking.status === 'delivered' ? booking.updatedAt : null,
      done: booking.status === 'delivered',
      icon: FileCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-brand-green/60 hover:text-brand-green transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-brand-green">{booking.reference}</h1>
            <p className="mt-1 text-sm text-brand-green/60">
              {booking.pickup.city} → {booking.destination?.city}
            </p>
          </div>
          <span className="rounded-full bg-brand-orange/10 px-4 py-1.5 text-sm font-medium text-brand-orange">
            {booking.status.replace('_', ' ')}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="font-serif text-xl text-brand-green">Delivery Timeline</h2>
              <div className="mt-6 space-y-6">
                {timeline.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          step.done
                            ? 'bg-brand-orange text-white'
                            : 'bg-brand-green/5 text-brand-green/30'
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      {i < timeline.length - 1 && (
                        <div
                          className={`mt-1 h-12 w-px ${
                            step.done ? 'bg-brand-orange/30' : 'bg-brand-green/10'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <p
                        className={`text-sm font-medium ${
                          step.done ? 'text-brand-green' : 'text-brand-green/40'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.detail && (
                        <p className="text-xs text-brand-green/60">{step.detail}</p>
                      )}
                      {step.date && (
                        <p className="text-xs text-brand-green/40">
                          {new Date(step.date).toLocaleString('en-NG')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Info */}
          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-brand-green">Pickup</h3>
              <p className="mt-2 text-sm text-brand-green/70">{booking.pickup.house}</p>
              <p className="text-sm text-brand-green/70">
                {booking.pickup.city}, {booking.pickup.state}
              </p>
              <p className="mt-1 text-xs text-brand-green/50">
                {booking.pickup.contactName} · {booking.pickup.contactPhone}
              </p>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-brand-green">Delivery</h3>
              <p className="mt-2 text-sm text-brand-green/70">{booking.delivery.address}</p>
              <p className="mt-1 text-xs text-brand-green/50">
                {booking.delivery.recipientName} · {booking.delivery.recipientPhone}
              </p>
            </Card>

            {/* Luggage Card — list + photos + proofs, all inside */}
            <Card>
              <h3 className="text-sm font-semibold text-brand-green">Luggage</h3>
              <ul className="mt-2 space-y-1 text-sm text-brand-green/70">
                {booking.luggage.map((b: any, i: number) => (
                  <li key={i}>
                    {b.quantity}× {b.type} · {b.weight}kg
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-brand-green/50">
                Total: {booking.totalBags} bags · {booking.totalWeight}kg
              </p>

              {/* Luggage Photos */}
              {booking.luggage.some((b: any) => b.photoUrl) && (
                <div className="mt-4 border-t border-brand-green/10 pt-3">
                  <p className="text-xs font-medium text-brand-green/70 mb-2">Luggage Photos</p>
                  <div className="flex flex-wrap gap-3">
                    {booking.luggage.map((b: any, i: number) =>
                      b.photoUrl ? (
                        <div key={i}>
                          <p className="mb-1 text-xs text-brand-green/50">{b.type}</p>
                          <img
                            src={b.photoUrl}
                            alt={b.type}
                            className="h-20 w-20 rounded-lg object-cover border border-brand-green/10"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Proof Photos */}
              {(booking.pickupProofUrl || booking.deliveryProofUrl) && (
                <div className="mt-4 border-t border-brand-green/10 pt-3">
                  <p className="text-xs font-medium text-brand-green/70 mb-2">Proof Photos</p>
                  <div className="flex flex-wrap gap-3">
                    {booking.pickupProofUrl && (
                      <div>
                        <p className="mb-1 text-xs text-brand-green/50">Pickup</p>
                        <img
                          src={booking.pickupProofUrl}
                          alt="Pickup proof"
                          className="h-24 w-24 rounded-lg object-cover border border-brand-green/10"
                        />
                      </div>
                    )}
                    {booking.deliveryProofUrl && (
                      <div>
                        <p className="mb-1 text-xs text-brand-green/50">Delivery</p>
                        <img
                          src={booking.deliveryProofUrl}
                          alt="Delivery proof"
                          className="h-24 w-24 rounded-lg object-cover border border-brand-green/10"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-brand-green">Payment</h3>
              <p className="mt-2 text-lg font-bold text-brand-green">{formatNaira(booking.price)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs">
                {booking.paymentStatus === 'paid' ? (
                  <><CheckCircle className="h-3 w-3 text-green-600" /> Paid</>
                ) : (
                  <><Clock className="h-3 w-3 text-brand-orange" /> Unpaid</>
                )}
              </p>
            </Card>

            {booking.paymentStatus === 'paid' && booking.otp && (
              <Card className="bg-brand-green/5">
                <h3 className="text-sm font-semibold text-brand-green">Delivery OTP</h3>
                <p className="mt-2 font-mono text-2xl font-bold text-brand-green">{booking.otp}</p>
                <p className="mt-1 text-xs text-brand-green/50">Share with driver on delivery</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}