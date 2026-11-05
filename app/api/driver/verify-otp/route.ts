import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'driver') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { bookingId, otp } = await req.json();
  if (!bookingId || !otp) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await connectDB();
  const booking = await Booking.findOne({
    _id: bookingId,
    assignedDriver: (session.user as any).id,
  });
  if (!booking) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (booking.otp !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });

  booking.status = 'delivered';
  await booking.save();
  return NextResponse.json({ success: true });
}