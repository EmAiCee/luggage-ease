'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        identifier: form.identifier,
        password: form.password,
        redirect: false,
      });
      if (result?.error) throw new Error('Invalid credentials');

      const sess = await fetch('/api/auth/session').then(r => r.json());
      const role = sess?.user?.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'driver') router.push('/driver');
      else router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-brand-green/10 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-brand-orange">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-3xl text-brand-green">Welcome back</h1>
          <p className="mt-2 text-sm text-brand-green/60">Customers: use your email. Drivers: use your Staff ID.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email or Staff ID"
            value={form.identifier}
            onChange={e => setForm({ ...form, identifier: e.target.value })}
            placeholder="you@example.com or LE-DRV-0001"
            required
          />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-green/60">
          New customer?{' '}
          <Link href="/register" className="font-semibold text-brand-orange hover:underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}