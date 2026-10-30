import { BookingWizard } from '@/components/booking/BookingWizard';

export default function NewBookingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-100 bg-white px-4 py-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Book Your Luggage Pickup</h1>
        <p className="mt-1 text-sm text-slate-500">Complete the steps below to schedule your door-to-door delivery.</p>
      </div>
      <BookingWizard />
    </main>
  );
}