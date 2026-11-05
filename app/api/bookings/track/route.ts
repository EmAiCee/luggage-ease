import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');
  if (!ref) return NextResponse.json({ error: 'Reference required' }, { status: 400 });

  await connectDB();
  const booking = await Booking.findOne({ reference: ref.toUpperCase() }).lean();
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  return NextResponse.json({ booking });
}