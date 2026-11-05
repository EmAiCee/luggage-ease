import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    // 1. Parse body safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 2. Block non-customer role self-registration
    if (body.role && body.role !== 'customer') {
      return NextResponse.json(
        { error: 'You cannot self-register as a driver or admin.' },
        { status: 403 }
      );
    }

    // 3. Extract + sanitize
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const phone = body.phone ? String(body.phone).trim() : undefined;

    // 4. Validate
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ error: 'Name is too short.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // 5. Connect
    await connectDB();

    // 6. Check existing (case-insensitive since email is lowercased)
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    // 7. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 8. Create customer
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: 'customer',
      emailVerified: false,
      phoneVerified: false,
    });

    // 9. Success
    return NextResponse.json(
      {
        success: true,
        id: user._id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Registration Error:', err);

    // Mongo duplicate key edge case
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Unable to create account. Please try again.' },
      { status: 500 }
    );
  }
}