'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get('reference');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }
    fetch(`/api/payments/verify?reference=${reference}`)
      .then(r => r.json())
      .then(data => setStatus(data.success ? 'success' : 'failed'))
      .catch(() => setStatus('failed'));
  }, [reference]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-green/10 bg-white p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-orange" />
            <p className="mt-4 text-sm text-brand-green/70">Verifying your payment…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-brand-orange" />
            <h1 className="mt-4 font-serif text-2xl text-brand-green">Payment Successful</h1>
            <p className="mt-2 text-sm text-brand-green/70">Your booking is confirmed. We'll assign a driver shortly.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 w-full">
              Go to Dashboard
            </Button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 font-serif text-2xl text-brand-green">Payment Failed</h1>
            <p className="mt-2 text-sm text-brand-green/70">Something went wrong. Please try again.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 w-full">
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}