import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { bookingId, driverId } = await req.json();
  if (!bookingId || !driverId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await connectDB();
  const booking = await Booking.findById(bookingId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.paymentStatus !== 'paid') {
    return NextResponse.json({ error: 'Booking must be paid first' }, { status: 400 });
  }

  booking.assignedDriver = driverId;
  booking.status = 'assigned';
  await booking.save();

  return NextResponse.json({ success: true });
}