import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

const ALLOWED = ['collected', 'in_transit'];

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'driver') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { bookingId, status } = await req.json();
  if (!bookingId || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectDB();
  const booking = await Booking.findOne({
    _id: bookingId,
    assignedDriver: (session.user as any).id,
  });
  if (!booking) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  booking.status = status;
  await booking.save();
  return NextResponse.json({ success: true });
}