'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira } from '@/lib/pricing';
import { Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, MapPin, User, Phone, Calendar } from 'lucide-react';

type Status = { type: 'info' | 'success' | 'error'; message: string } | null;

export default function DriverDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, Status>>({});

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/driver/jobs');
    const json = await res.json();
    if (res.ok) setJobs(json.jobs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    await fetch('/api/driver/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status: newStatus }),
    });
    load();
  };

  const verifyOtp = async (bookingId: string) => {
    const otp = otpInput[bookingId];
    if (!otp) return;
    const res = await fetch('/api/driver/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, otp }),
    });
    const json = await res.json();
    if (res.ok) { alert('Delivered!'); load(); }
    else alert(json.error);
  };

  const setJobStatus = (key: string, s: Status) => setStatus(prev => ({ ...prev, [key]: s }));

  const uploadProof = async (
    bookingId: string,
    type: 'pickup' | 'delivery',
    file: File
  ) => {
    const key = `${bookingId}-${type}`;
    setUploading(prev => ({ ...prev, [key]: true }));
    setJobStatus(key, { type: 'info', message: 'Uploading image…' });

    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (!sessionData?.user) {
        setJobStatus(key, { type: 'error', message: 'Session expired. Please log in again.' });
        return;
      }

      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.url) {
        const errMsg = uploadData?.error || `HTTP ${uploadRes.status}`;
        setJobStatus(key, { type: 'error', message: `Upload failed: ${errMsg}` });
        return;
      }

      setJobStatus(key, { type: 'info', message: 'Saving to record…' });

      const saveRes = await fetch('/api/driver/upload-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, type, url: uploadData.url }),
      });
      const saveData = await saveRes.json();

      if (!saveRes.ok || !saveData.success) {
        const errMsg = saveData?.error || `HTTP ${saveRes.status}`;
        setJobStatus(key, { type: 'error', message: `Could not save image: ${errMsg}` });
        return;
      }

      await load();
      setJobStatus(key, { type: 'success', message: 'Image uploaded successfully.' });
    } catch (err: any) {
      setJobStatus(key, { type: 'error', message: err.message || 'Something went wrong.' });
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl text-brand-green">Driver Dashboard</h1>
        <p className="mt-1 text-sm text-brand-green/60">Manage your assigned deliveries.</p>

        {jobs.length === 0 ? (
          <Card className="mt-8 text-center text-brand-green/60">No assigned jobs.</Card>
        ) : (
          <div className="mt-8 space-y-3">
            {jobs.map((j: any) => {
              const pickupKey = `${j._id}-pickup`;
              const deliveryKey = `${j._id}-delivery`;
              const pickupUploading = uploading[pickupKey];
              const deliveryUploading = uploading[deliveryKey];
              const pickupStatus = status[pickupKey];
              const deliveryStatus = status[deliveryKey];

              return (
                <Card key={j._id}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-brand-green">{j.reference}</p>
                      <p className="text-xs text-brand-green/60">
                        {j.totalBags} bags · {j.totalWeight}kg · {formatNaira(j.price)}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                      {j.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Full addresses */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-brand-green/10 bg-brand-green/5 p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-brand-green/60">Pickup</p>
                          <p className="text-sm font-medium text-brand-green">{j.pickup.house}</p>
                          <p className="text-xs text-brand-green/60">
                            {j.pickup.city}, {j.pickup.state}, {j.pickup.country}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/70">
                            <User className="h-3 w-3" /> {j.pickup.contactName}
                            <Phone className="ml-2 h-3 w-3" /> {j.pickup.contactPhone}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/50">
                            <Calendar className="h-3 w-3" /> Pickup on{' '}
                            {new Date(j.pickup.date).toLocaleDateString('en-NG', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-brand-green/10 bg-brand-green/5 p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-brand-green/60">Delivery</p>
                          <p className="text-sm font-medium text-brand-green">{j.delivery.address}</p>
                          <p className="text-xs text-brand-green/60">
                            {j.destination?.city}, {j.destination?.state}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/70">
                            <User className="h-3 w-3" /> {j.delivery.recipientName}
                            <Phone className="ml-2 h-3 w-3" /> {j.delivery.recipientPhone}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-brand-green/50">
                            <Calendar className="h-3 w-3" /> Deliver by{' '}
                            {new Date(j.delivery.date).toLocaleDateString('en-NG', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {j.delivery.instructions && (
                    <p className="mt-3 rounded-lg bg-brand-cream px-3 py-2 text-xs italic text-brand-green/60">
                      Note: {j.delivery.instructions}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {j.status === 'assigned' && (
                      <Button size="sm" onClick={() => updateStatus(j._id, 'collected')}>
                        Mark Collected
                      </Button>
                    )}
                    {j.status === 'collected' && (
                      <Button size="sm" onClick={() => updateStatus(j._id, 'in_transit')}>
                        Mark In Transit
                      </Button>
                    )}
                    {j.status === 'in_transit' && (
                      <div className="flex w-full gap-2">
                        <Input
                          placeholder="Enter 6-digit OTP"
                          value={otpInput[j._id] || ''}
                          onChange={e => setOtpInput({ ...otpInput, [j._id]: e.target.value })}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => verifyOtp(j._id)}>
                          Verify & Deliver
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Pickup Proof */}
                  <div className="mt-4 border-t border-brand-green/10 pt-3">
                    <p className="mb-1 text-xs font-medium text-brand-green/70">Pickup Proof</p>
                    <ProofUpload
                      imageUrl={j.pickupProofUrl}
                      uploading={pickupUploading}
                      onFile={file => uploadProof(j._id, 'pickup', file)}
                    />
                    {pickupStatus && <StatusMessage status={pickupStatus} />}
                  </div>

                  {/* Delivery Proof */}
                  {j.status === 'in_transit' && (
                    <div className="mt-4 border-t border-brand-green/10 pt-3">
                      <p className="mb-1 text-xs font-medium text-brand-green/70">Delivery Proof</p>
                      <ProofUpload
                        imageUrl={j.deliveryProofUrl}
                        uploading={deliveryUploading}
                        onFile={file => uploadProof(j._id, 'delivery', file)}
                      />
                      {deliveryStatus && <StatusMessage status={deliveryStatus} />}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function ProofUpload({
  imageUrl,
  uploading,
  onFile,
}: {
  imageUrl?: string;
  uploading?: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Proof"
          className="h-20 w-20 rounded-lg object-cover border border-brand-green/10"
        />
      )}
      <label
        className={`flex cursor-pointer items-center gap-2 text-xs ${
          uploading ? 'text-brand-green/40' : 'text-brand-green/60 hover:text-brand-orange'
        }`}
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
        ) : imageUrl ? (
          <><RefreshCw className="h-4 w-4" /> Replace photo</>
        ) : (
          <><Upload className="h-4 w-4" /> Upload photo</>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

function StatusMessage({ status }: { status: { type: 'info' | 'success' | 'error'; message: string } }) {
  const styles =
    status.type === 'error'
      ? 'bg-red-50 text-red-700 border-red-200'
      : status.type === 'success'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-brand-cream text-brand-green/80 border-brand-green/10';

  return (
    <div className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles}`}>
      {status.type === 'error' ? (
        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
      ) : status.type === 'success' ? (
        <CheckCircle className="mt-0.5 h-3 w-3 shrink-0" />
      ) : (
        <Loader2 className="mt-0.5 h-3 w-3 shrink-0 animate-spin" />
      )}
      <span className="break-words">{status.message}</span>
    </div>
  );
}