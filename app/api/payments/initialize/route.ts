import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: Math.round(booking.price * 100), // Kobo (NGN × 100)
        reference: booking.reference,
        callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
        metadata: {
          bookingId: booking._id.toString(),
          userId: (session.user as any).id,
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackData.status) {
      return NextResponse.json({ error: paystackData.message }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}