'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function StepDestination({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [form, setForm] = useState({
    state: data.state || '',
    city: data.city || '',
    address: data.address || '',
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!form.state || !form.city || !form.address) {
      setError('Please fill in all destination fields.');
      return;
    }
    setError('');
    onNext(form);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Where are you traveling to?</h2>
      <p className="text-sm text-slate-500">Tell us about your travel destination.</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Destination State *" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <Input label="Destination City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
      </div>
      <Input label="Destination Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext}>Continue →</Button>
      </div>
    </div>
  );
}