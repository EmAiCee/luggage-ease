import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { User } from '@/models/User';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .populate('assignedDriver', 'name email phone')
    .lean();
  const drivers = await User.find({ role: 'driver' }).select('name email phone').lean();

  return NextResponse.json({ bookings, drivers });
}