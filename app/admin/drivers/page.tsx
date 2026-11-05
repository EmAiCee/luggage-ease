'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserPlus, Copy, RefreshCw } from 'lucide-react';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [newCredentials, setNewCredentials] = useState<{ staffId: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/drivers');
    const json = await res.json();
    if (res.ok) setDrivers(json.drivers);
  };

  useEffect(() => { load(); }, []);

  const createDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNewCredentials(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewCredentials(data.credentials);
      setForm({ name: '', phone: '', email: '' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (driverId: string) => {
    if (!confirm('Reset this driver\'s password? A new password will be shown once.')) return;
    const res = await fetch('/api/admin/drivers/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId }),
    });
    const data = await res.json();
    if (res.ok) setNewCredentials(data.credentials);
    else alert(data.error);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl text-brand-green">Manage Drivers</h1>
        <p className="mt-1 text-sm text-brand-green/60">Create driver accounts. Only admins can do this.</p>

        {/* Create driver */}
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-brand-green">Add New Driver</h2>
          <form onSubmit={createDriver} className="mt-4 space-y-3">
            <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Email (optional)" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Button type="submit" loading={loading} className="gap-2">
              <UserPlus className="h-4 w-4" /> Create Driver Account
            </Button>
          </form>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {newCredentials && (
            <div className="mt-4 rounded-xl bg-brand-orange/10 p-4">
              <p className="text-sm font-semibold text-brand-green">⚠️ Save these credentials — the password won't be shown again:</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-white px-2 py-1 rounded">{newCredentials.staffId}</span>
                  <button onClick={() => copy(newCredentials.staffId)}><Copy className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-white px-2 py-1 rounded">{newCredentials.password}</span>
                  <button onClick={() => copy(newCredentials.password)}><Copy className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Drivers list */}
        <h2 className="mt-10 font-serif text-2xl text-brand-green">All Drivers ({drivers.length})</h2>
        <div className="mt-4 space-y-3">
          {drivers.map((d: any) => (
            <Card key={d._id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-brand-green">{d.name}</p>
                <p className="font-mono text-xs text-brand-green/60">{d.staffId}</p>
                <p className="text-xs text-brand-green/60">{d.phone}{d.email ? ` · ${d.email}` : ''}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => resetPassword(d._id)} className="gap-2">
                <RefreshCw className="h-3 w-3" /> Reset Password
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}