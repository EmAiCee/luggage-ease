import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { driverId } = await req.json();
  if (!driverId) return NextResponse.json({ error: 'Driver ID required' }, { status: 400 });

  await connectDB();
  const driver = await User.findOne({ _id: driverId, role: 'driver' });
  if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

  const plainPassword = Math.random().toString(36).slice(-10);
  const hashed = await bcrypt.hash(plainPassword, 10);

  driver.password = hashed;
  driver.mustChangePassword = true;
  await driver.save();

  return NextResponse.json({
    success: true,
    credentials: { staffId: driver.staffId, password: plainPassword },
  });
}