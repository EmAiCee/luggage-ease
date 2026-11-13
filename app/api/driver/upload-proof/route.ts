import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'driver') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { bookingId, type, url } = await req.json();
  if (!bookingId || !url || !['pickup', 'delivery'].includes(type)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await connectDB();
  const booking = await Booking.findOne({
    _id: bookingId,
    assignedDriver: (session.user as any).id,
  });
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (type === 'pickup') booking.pickupProofUrl = url;
  else booking.deliveryProofUrl = url;
  await booking.save();

  return NextResponse.json({ success: true });
}