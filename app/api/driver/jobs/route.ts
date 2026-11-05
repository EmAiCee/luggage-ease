import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'driver') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const jobs = await Booking.find({ assignedDriver: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ jobs });
}