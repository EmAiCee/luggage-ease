'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { calculatePrice, formatNaira } from '@/lib/pricing';
import { CheckCircle, Loader2 } from 'lucide-react';

export function StepReview({ data, onBack }: { data: any; onBack: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const totalBags = data.luggage?.reduce((s: number, b: any) => s + Number(b.quantity || 0), 0) || 0;
  const totalWeight = data.luggage?.reduce((s: number, b: any) => s + Number(b.weight || 0) * Number(b.quantity || 0), 0) || 0;

  const price = useMemo(() => calculatePrice({
    pickupCity: data.pickup?.city || '',
    destinationCity: data.destination?.city || '',
    totalWeight,
    totalBags,
  }), [data, totalBags, totalWeight]);

  const submitBooking = async () => {
    setError('');
    
    // Final safeguard
    if (!data.pickup?.city || !data.destination?.city || !data.luggage?.length) {
      setError('Some booking details are missing. Please go back and complete all steps.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: data.pickup,
          destination: data.destination,
          luggage: data.luggage,
          delivery: data.delivery,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create booking');
      
      setSuccess(result.reference);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-16 w-16 text-brand-orange" />
        <h2 className="mt-4 font-serif text-2xl text-brand-green">Booking Confirmed!</h2>
        <p className="mt-2 text-sm text-brand-green/70">Your booking reference is</p>
        <p className="mt-2 font-mono text-xl font-bold text-brand-green">{success}</p>
        <p className="mt-6 text-sm text-brand-green/60">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review & Confirm</h2>

      {/* Pickup */}
      <div className="rounded-lg border border-brand-green/10 p-4">
        <h3 className="text-sm font-semibold text-brand-green">Pickup</h3>
        <p className="text-sm text-brand-green/70">{data.pickup?.house}, {data.pickup?.city}, {data.pickup?.state}</p>
        <p className="text-xs text-brand-green/50">Contact: {data.pickup?.contactName} · {data.pickup?.contactPhone}</p>
      </div>

      {/* Destination */}
      <div className="rounded-lg border border-brand-green/10 p-4">
        <h3 className="text-sm font-semibold text-brand-green">Destination</h3>
        <p className="text-sm text-brand-green/70">{data.destination?.city}, {data.destination?.state}</p>
        <p className="text-xs text-brand-green/50">{data.destination?.address}</p>
      </div>

      {/* Luggage */}
      <div className="rounded-lg border border-brand-green/10 p-4">
        <h3 className="text-sm font-semibold text-brand-green">Luggage</h3>
        <ul className="mt-1 space-y-1 text-sm text-brand-green/70">
          {data.luggage?.map((b: any, i: number) => (
            <li key={i}>• {b.quantity}× {b.type} ({b.weight}kg each)</li>
          ))}
        </ul>
        <p className="mt-2 text-xs font-medium text-brand-green">Total: {totalBags} bags · {totalWeight} kg</p>
      </div>

      {/* Delivery */}
      <div className="rounded-lg border border-brand-green/10 p-4">
        <h3 className="text-sm font-semibold text-brand-green">Delivery</h3>
        <p className="text-sm text-brand-green/70">{data.delivery?.address}</p>
        <p className="text-xs text-brand-green/50">Recipient: {data.delivery?.recipientName} · {data.delivery?.recipientPhone}</p>
      </div>

      {/* Price */}
      {/* Price */}
<div className="rounded-lg bg-brand-green/5 p-4">
  <h3 className="text-sm font-semibold text-brand-green">Price Breakdown</h3>
  <div className="mt-2 space-y-1 text-sm text-brand-green/80">
    <div className="flex justify-between"><span>Base fare</span><span>{formatNaira(price.basePrice)}</span></div>
    <div className="flex justify-between"><span>Distance ({price.distanceKm} km)</span><span>{formatNaira(price.distanceFee)}</span></div>
    <div className="flex justify-between"><span>Weight ({totalWeight} kg)</span><span>{formatNaira(price.weightFee)}</span></div>
    <div className="flex justify-between"><span>Bags ({totalBags})</span><span>{formatNaira(price.bagFee)}</span></div>
    <div className="mt-2 flex justify-between border-t border-brand-green/10 pt-2 text-base font-bold text-brand-green">
      <span>Total</span><span>{formatNaira(price.total)}</span>
    </div>
  </div>
</div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={submitBooking} disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirm Booking
        </Button>
      </div>
    </div>
  );
}