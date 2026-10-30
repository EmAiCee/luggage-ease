'use client';

import { useState } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Bag { id: string; type: string; quantity: number; weight: number; description: string; }

export function StepLuggage({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [bags, setBags] = useState<Bag[]>([{ id: '1', type: 'Suitcase', quantity: 1, weight: 10, description: '' }]);

  const addBag = () => setBags([...bags, { id: Date.now().toString(), type: 'Suitcase', quantity: 1, weight: 5, description: '' }]);
  const removeBag = (id: string) => setBags(bags.filter(b => b.id !== id));
  const updateBag = (id: string, field: keyof Bag, value: any) => setBags(bags.map(b => b.id === id ? { ...b, [field]: value } : b));

  const totalBags = bags.reduce((s, b) => s + b.quantity, 0);
  const totalWeight = bags.reduce((s, b) => s + b.weight * b.quantity, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Luggage Details</h2>
      <p className="text-sm text-slate-500">Add each bag you want us to transport.</p>

      {bags.map((bag) => (
        <div key={bag.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-brand-600" /><span className="text-sm font-medium">Bag {bag.id.slice(0, 4)}</span></div>
            {bags.length > 1 && <button onClick={() => removeBag(bag.id)}><Trash2 className="h-4 w-4 text-red-400" /></button>}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Input label="Type" value={bag.type} onChange={e => updateBag(bag.id, 'type', e.target.value)} />
            <Input label="Quantity" type="number" value={bag.quantity} onChange={e => updateBag(bag.id, 'quantity', +e.target.value)} />
            <Input label="Weight (kg)" type="number" value={bag.weight} onChange={e => updateBag(bag.id, 'weight', +e.target.value)} />
          </div>
          <Input label="Description" className="mt-2" value={bag.description} onChange={e => updateBag(bag.id, 'description', e.target.value)} placeholder="e.g., Black hard-shell suitcase" />
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addBag} className="gap-1"><Plus className="h-4 w-4" /> Add Another Bag</Button>

      <div className="rounded-xl bg-brand-50 p-4 text-sm">
        <div className="flex justify-between"><span>Total Bags:</span><span className="font-bold">{totalBags}</span></div>
        <div className="flex justify-between"><span>Total Weight:</span><span className="font-bold">{totalWeight} kg</span></div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={() => onNext(bags)}>Continue →</Button>
      </div>
    </div>
  );
}