import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: 'customer',
    });

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}