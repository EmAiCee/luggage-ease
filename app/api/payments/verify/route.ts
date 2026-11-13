import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { sendPaymentConfirmedAdminEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 });

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.findOne({ reference });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paidAt = new Date();
    await booking.save();
    // Notify admin after successful payment
    try {
  await sendPaymentConfirmedAdminEmail(
    booking.reference,
    booking.price
  );

  console.log('Payment confirmation email sent to admin.');
} catch (emailError) {
  console.error('Failed to send admin payment email:', emailError);
}


    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}