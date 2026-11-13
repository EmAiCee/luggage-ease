'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatNaira } from '@/lib/pricing';
import { MapPin, User, Phone, Calendar, Package, Truck } from 'lucide-react';

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
        <p className="mt-1 text-sm text-brand-green/60">
          Review and assign paid bookings to drivers.
        </p>

        {data.bookings.length === 0 ? (
          <Card className="mt-8 text-center text-brand-green/60">No bookings yet.</Card>
        ) : (
          <div className="mt-8 space-y-3">
            {data.bookings.map((b: any) => (
              <Card key={b._id}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm font-semibold text-brand-green">{b.reference}</p>
                    <p className="text-xs text-brand-green/60">
                      {b.totalBags} bags · {b.totalWeight}kg · {formatNaira(b.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                      {b.status.replace('_', ' ')}
                    </span>
                    {/* <p className={`mt-1 text-xs ${b.paymentStatus === 'paid' ? 'text-green-600' : 'text-brand-green/50'}`}>
                      {b.paymentStatus === 'paid' ? 'Paid' : ' Unpaid'}
                    </p> */}
                  </div>
                </div>

                {/* Pickup + Delivery addresses */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-brand-green/10 bg-brand-green/5 p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-brand-green/60">Pickup</p>
                        <p className="text-sm font-medium text-brand-green">{b.pickup.house}</p>
                        <p className="text-xs text-brand-green/60">
                          {b.pickup.city}, {b.pickup.state}, {b.pickup.country}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/70">
                          <User className="h-3 w-3" /> {b.pickup.contactName}
                          <Phone className="ml-2 h-3 w-3" /> {b.pickup.contactPhone}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/50">
                          <Calendar className="h-3 w-3" /> Pickup on{' '}
                          {new Date(b.pickup.date).toLocaleDateString('en-NG', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-brand-green/10 bg-brand-green/5 p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-brand-green/60">Delivery</p>
                        <p className="text-sm font-medium text-brand-green">{b.delivery.address}</p>
                        <p className="text-xs text-brand-green/60">
                          {b.destination?.city}, {b.destination?.state}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/70">
                          <User className="h-3 w-3" /> {b.delivery.recipientName}
                          <Phone className="ml-2 h-3 w-3" /> {b.delivery.recipientPhone}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/50">
                          <Calendar className="h-3 w-3" /> Deliver by{' '}
                          {new Date(b.delivery.date).toLocaleDateString('en-NG', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luggage summary */}
                <div className="mt-3 flex items-center gap-2 text-xs text-brand-green/60">
                  <Package className="h-3 w-3" />
                  <span>
                    {b.luggage?.map((l: any) => `${l.quantity}× ${l.type} (${l.weight}kg)`).join(' · ')}
                  </span>
                </div>

                {/* Instructions */}
                {b.delivery?.instructions && (
                  <p className="mt-2 rounded-lg bg-brand-cream px-3 py-2 text-xs italic text-brand-green/60">
                    Note: {b.delivery.instructions}
                  </p>
                )}

                {/* Assignment */}
                <div className="mt-4 flex items-center justify-between border-t border-brand-green/10 pt-3">
                  <div className="text-xs text-brand-green/60">
                    {b.assignedDriver ? (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-brand-orange" />
                        <span className="text-brand-green">
                          Driver: <strong>{b.assignedDriver.name}</strong>
                        </span>
                        {b.assignedDriver.staffId && (
                          <span className="font-mono text-brand-green/50">
                            ({b.assignedDriver.staffId})
                          </span>
                        )}
                      </span>
                    ) : b.paymentStatus === 'paid' ? (
                      <span className="text-brand-orange">Awaiting driver assignment</span>
                    ) : (
                      <span>Waiting for customer payment</span>
                    )}
                  </div>

                  <div>
                    {b.paymentStatus === 'paid' && !b.assignedDriver && (
                      <select
                        className="rounded-lg border border-brand-green/20 bg-white px-3 py-1.5 text-sm text-brand-green focus:border-brand-orange focus:outline-none"
                        onChange={e => e.target.value && assign(b._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Assign Driver…</option>
                        {data.drivers.map((d: any) => (
                          <option key={d._id} value={d._id}>
                            {d.name} {d.staffId ? `(${d.staffId})` : d.email ? `(${d.email})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}