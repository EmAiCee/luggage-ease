'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      router.push('/dashboard');
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
          <h1 className="mt-4 font-serif text-3xl text-brand-green">Create your account</h1>
          <p className="mt-2 text-sm text-brand-green/60">Start shipping luggage with ease.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />

          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-green/60">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-orange hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}