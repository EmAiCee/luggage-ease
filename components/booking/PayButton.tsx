'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';

export function PayButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <Button onClick={pay} disabled={loading} className="w-full gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      Pay Now
    </Button>
  );
}