'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Package, Truck, Clock } from 'lucide-react';
import { formatNaira } from '@/lib/pricing'; // <-- Added this import

export default function TrackPage() {
  const [reference, setReference] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/track?ref=${encodeURIComponent(reference)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking not found');
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center font-serif text-4xl text-brand-green">Track Your Luggage</h1>
        <p className="mt-2 text-center text-sm text-brand-green/60">Enter your booking reference to see status.</p>

        <form onSubmit={track} className="mt-8 flex gap-3">
          <Input
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="e.g. LE-A1B2C3D4"
            className="flex-1"
          />
          <Button type="submit" loading={loading}>Track</Button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        {booking && (
          <div className="mt-8 rounded-2xl border border-brand-green/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-brand-green">{booking.reference}</p>
                <p className="text-xs text-brand-green/60">{booking.pickup?.city} → {booking.destination?.city}</p>
              </div>
              <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                {booking.status}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-green" /> {booking.totalBags} bags · {booking.totalWeight}kg
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand-green" /> {formatNaira(booking.price)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-green" /> Created {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}