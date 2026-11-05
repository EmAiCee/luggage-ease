'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function StepPickup({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [form, setForm] = useState({
    house: data.house || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || 'Nigeria',
    contactName: data.contactName || '',
    contactPhone: data.contactPhone || '',
    date: data.date || '',
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    // Individual checks for clearer error messages
    if (!form.house.trim()) {
      setError('Please enter the house address.');
      return;
    }
    if (!form.city.trim()) {
      setError('Please enter the city.');
      return;
    }
    if (!form.state.trim()) {
      setError('Please enter the state/region.');
      return;
    }
    if (!form.country.trim()) {
      setError('Please enter the country.');
      return;
    }
    if (!form.contactName.trim()) {
      setError('Please enter the contact name.');
      return;
    }
    if (!form.contactPhone.trim()) {
      setError('Please enter the contact phone number.');
      return;
    }
    if (!form.date) {
      setError('Please select a pickup date.');
      return;
    }
    setError('');
    onNext(form);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Where should we collect your luggage?</h2>
      <p className="text-sm text-slate-500">Enter your pickup address and contact details.</p>
      
      <Input 
        label="House Address *" 
        value={form.house} 
        onChange={e => setForm({ ...form, house: e.target.value })} 
        placeholder="123 Main Street" 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input label="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <Input label="State / Region *" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
      </div>
      
      <Input label="Country *" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
      
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contact Name *" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
        <Input label="Contact Phone *" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
      </div>
      
      <Input 
        label="Pickup Date *" 
        type="date" 
        value={form.date} 
        onChange={e => setForm({ ...form, date: e.target.value })} 
      />

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>Continue →</Button>
      </div>
    </div>
  );
}