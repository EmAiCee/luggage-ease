'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira } from '@/lib/pricing';

export default function DriverDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/driver/jobs');
    const json = await res.json();
    if (res.ok) setJobs(json.jobs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (bookingId: string, status: string) => {
    await fetch('/api/driver/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status }),
    });
    load();
  };

  const verifyOtp = async (bookingId: string) => {
    const otp = otpInput[bookingId];
    if (!otp) return;
    const res = await fetch('/api/driver/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, otp }),
    });
    const json = await res.json();
    if (res.ok) { alert('Delivered!'); load(); }
    else alert(json.error);
  };

  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl text-brand-green">Driver Dashboard</h1>
        <p className="mt-1 text-sm text-brand-green/60">Manage your assigned deliveries.</p>

        {jobs.length === 0 ? (
          <Card className="mt-8 text-center text-brand-green/60">No assigned jobs.</Card>
        ) : (
          <div className="mt-8 space-y-3">
            {jobs.map((j: any) => (
              <Card key={j._id}>
                <p className="font-mono text-sm font-semibold">{j.reference}</p>
                <p className="text-xs text-brand-green/70">{j.pickup.house}, {j.pickup.city}</p>
                <p className="text-xs text-brand-green/70">→ {j.delivery.address}</p>
                <p className="text-xs text-brand-green/70">Contact: {j.pickup.contactName} · {j.pickup.contactPhone}</p>
                <p className="text-xs text-brand-green/70">{j.totalBags} bags · {j.totalWeight}kg · {formatNaira(j.price)}</p>
                <p className="mt-2 text-xs font-semibold text-brand-orange">Status: {j.status}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {j.status === 'assigned' && (
                    <Button size="sm" onClick={() => updateStatus(j._id, 'collected')}>Mark Collected</Button>
                  )}
                  {j.status === 'collected' && (
                    <Button size="sm" onClick={() => updateStatus(j._id, 'in_transit')}>Mark In Transit</Button>
                  )}
                  {j.status === 'in_transit' && (
                    <div className="flex w-full gap-2">
                      <Input
                        placeholder="Enter 6-digit OTP"
                        value={otpInput[j._id] || ''}
                        onChange={e => setOtpInput({ ...otpInput, [j._id]: e.target.value })}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => verifyOtp(j._id)}>Verify & Deliver</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}