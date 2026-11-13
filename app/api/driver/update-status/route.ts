import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { sendCollectedEmail } from '@/lib/email';
import { User } from '@/models/User';

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
 if (status === 'collected') {
  try {
    const customer = await User.findById(booking.userId);

    if (customer?.email) {
      await sendCollectedEmail(
        customer.email,
        booking.reference
      );
    }
  } catch (emailError) {
    console.error('Failed to send collection email:', emailError);
  }
}
  return NextResponse.json({ success: true });
}