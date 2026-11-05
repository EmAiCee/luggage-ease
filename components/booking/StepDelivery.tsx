'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function StepDelivery({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [form, setForm] = useState({
    address: data.address || '',
    recipientName: data.recipientName || '',
    recipientPhone: data.recipientPhone || '',
    date: data.date || '',
    instructions: data.instructions || '',
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!form.address || !form.recipientName || !form.recipientPhone) {
      setError('Please fill in all delivery details.');
      return;
    }
    if (!form.date) {
      setError('Please select a delivery date.');
      return;
    }
    setError('');
    onNext(form);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Delivery Preferences</h2>
      <p className="text-sm text-slate-500">Who will receive the luggage, and where?</p>
      
      <Input label="Delivery Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Recipient Name *" value={form.recipientName} onChange={e => setForm({ ...form, recipientName: e.target.value })} />
        <Input label="Recipient Phone *" value={form.recipientPhone} onChange={e => setForm({ ...form, recipientPhone: e.target.value })} />
      </div>
      <Input label="Delivery Date *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      <Input label="Special Instructions" value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="e.g., Leave with the concierge" />

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext}>Continue →</Button>
      </div>
    </div>
  );
}