import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const booking = await Booking.findById(id).populate('assignedDriver', 'name phone staffId').lean();

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const isOwner = booking.userId.toString() === userId;
  const isAdmin = role === 'admin';
  const isAssignedDriver =
    booking.assignedDriver && (booking.assignedDriver as any)._id?.toString() === userId;

  if (!isOwner && !isAdmin && !isAssignedDriver) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ booking });
}