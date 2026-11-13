import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { User } from '@/models/User';
import { sendDriverAssignedEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bookingId, driverId } = await req.json();
    if (!bookingId || !driverId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Booking must be paid first' }, { status: 400 });
    }

    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

    booking.assignedDriver = driverId as any;
    booking.status = 'assigned';
    await booking.save();

    // Send email to driver — non-blocking
    if (driver.email) {
      try {
        await sendDriverAssignedEmail(
          driver.email,
          driver.name,
          booking.reference,
          {
            house: booking.pickup.house,
            city: booking.pickup.city,
            state: booking.pickup.state,
          },
          {
            address: booking.delivery.address,
            recipientName: booking.delivery.recipientName,
            recipientPhone: booking.delivery.recipientPhone,
          },
          booking.delivery.date
        );
        console.log(`📧 Driver assignment email sent → ${driver.email}`);
      } catch (emailErr) {
        console.error('Failed to send driver assignment email:', emailErr);
      }
    } else {
      console.warn(`⚠️  Driver ${driver.staffId} has no email — assignment email skipped`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Assign error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}