'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/pricing';

export default function AdminPage() {
  const [data, setData] = useState<{ bookings: any[]; drivers: any[] }>({ bookings: [], drivers: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/bookings');
    const json = await res.json();
    if (res.ok) setData(json);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const assign = async (bookingId: string, driverId: string) => {
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, driverId }),
    });
    const json = await res.json();
    if (res.ok) load();
    else alert(json.error);
  };

  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-3xl text-brand-green">Admin — Bookings</h1>

        <div className="mt-8 space-y-3">
          {data.bookings.map((b: any) => (
            <Card key={b._id}>
              <div className="flex justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{b.reference}</p>
                  <p className="text-xs text-brand-green/60">{b.pickup.city} → {b.destination?.city}</p>
                  <p className="text-xs text-brand-green/60">{formatNaira(b.price)} · {b.status} · {b.paymentStatus}</p>
                </div>
                <div>
                  {b.paymentStatus === 'paid' && !b.assignedDriver && (
                    <select
                      className="rounded border px-3 py-1.5 text-sm"
                      onChange={e => e.target.value && assign(b._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Assign Driver…</option>
                      {data.drivers.map((d: any) => (
                        <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                      ))}
                    </select>
                  )}
                  {b.assignedDriver && (
                    <p className="text-xs text-brand-green/70">Driver: {b.assignedDriver.name}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}