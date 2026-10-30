'use client';

import { useState } from 'react';
import { StepPickup } from './StepPickup';
import { StepDestination } from './StepDestination';
import { StepLuggage } from './StepLuggage';
import { StepDelivery } from './StepDelivery';
import { StepReview } from './StepReview';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const steps = ['Pickup', 'Destination', 'Luggage', 'Delivery', 'Review'];

export function BookingWizard() {
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({
    pickup: {},
    destination: {},
    luggage: [],
    delivery: {},
  });

  const update = (key: string, data: any) => setFormData(prev => ({ ...prev, [key]: data }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Stepper */}
      <div className="mb-10 flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
              i < current ? 'bg-brand-600 text-white' :
              i === current ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`ml-2 hidden text-sm font-medium sm:block ${i <= current ? 'text-slate-900' : 'text-slate-400'}`}>
              {step}
            </span>
            {i < steps.length - 1 && <div className={`mx-3 h-px w-8 sm:w-16 ${i < current ? 'bg-brand-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        {current === 0 && <StepPickup data={formData.pickup} onNext={(d) => { update('pickup', d); setCurrent(1); }} />}
        {current === 1 && <StepDestination data={formData.destination} onNext={(d) => { update('destination', d); setCurrent(2); }} onBack={() => setCurrent(0)} />}
        {current === 2 && <StepLuggage data={formData.luggage} onNext={(d) => { update('luggage', d); setCurrent(3); }} onBack={() => setCurrent(1)} />}
        {current === 3 && <StepDelivery data={formData.delivery} onNext={(d) => { update('delivery', d); setCurrent(4); }} onBack={() => setCurrent(2)} />}
        {current === 4 && <StepReview data={formData} onBack={() => setCurrent(3)} />}
      </div>
    </div>
  );
}