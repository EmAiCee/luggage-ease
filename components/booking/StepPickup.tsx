'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function StepPickup({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [form, setForm] = useState({ address: '', city: '', state: '', country: '', contactName: '', contactPhone: '', date: '' });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Where should we collect your luggage?</h2>
      <p className="text-sm text-slate-500">Enter your pickup address and contact details.</p>
      <Input label="House Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <Input label="State / Region" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
      </div>
      <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contact Name" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
        <Input label="Contact Phone" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
      </div>
      <Input label="Pickup Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      <div className="flex justify-end pt-4">
        <Button onClick={() => onNext(form)}>Continue <span className="ml-1">→</span></Button>
      </div>
    </div>
  );
}