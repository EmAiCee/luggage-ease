import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const drivers = await User.find({ role: 'driver' })
    .select('name email phone staffId createdAt')
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ drivers });
}

function generateStaffId(count: number) {
  return `LE-DRV-${String(count + 1).padStart(4, '0')}`;
}

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, phone, email } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  await connectDB();

  // Generate next staff ID based on existing driver count
  const driverCount = await User.countDocuments({ role: 'driver' });
  const staffId = generateStaffId(driverCount);
  const plainPassword = generatePassword();
  const hashed = await bcrypt.hash(plainPassword, 10);

  try {
    const driver = await User.create({
      name,
      phone,
      email: email ? email.toLowerCase() : undefined,
      role: 'driver',
      staffId,
      password: hashed,
      mustChangePassword: true,
      emailVerified: !!email,
      phoneVerified: true,
    });

    return NextResponse.json({
      success: true,
      driver: {
        _id: driver._id,
        name: driver.name,
        staffId: driver.staffId,
        phone: driver.phone,
        email: driver.email,
      },
      credentials: {
        staffId,
        password: plainPassword,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}