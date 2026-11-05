
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { calculatePrice } from '@/lib/pricing';
import { v4 as uuidv4 } from 'uuid';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // 2. Parse Request Body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const { pickup, destination, luggage, delivery } = body;

    // 3. Detailed Validation
    if (!pickup || !destination || !luggage || !delivery) {
      return NextResponse.json(
        { error: 'Missing booking sections (pickup, destination, luggage, or delivery).' },
        { status: 400 }
      );
    }

    if (!pickup.house) return NextResponse.json({ error: 'Pickup house address is required.' }, { status: 400 });
    if (!pickup.city) return NextResponse.json({ error: 'Pickup city is required.' }, { status: 400 });
    if (!pickup.state) return NextResponse.json({ error: 'Pickup state is required.' }, { status: 400 });
    if (!pickup.contactName) return NextResponse.json({ error: 'Pickup contact name is required.' }, { status: 400 });
    if (!pickup.contactPhone) return NextResponse.json({ error: 'Pickup contact phone is required.' }, { status: 400 });

    if (!destination.city) return NextResponse.json({ error: 'Destination city is required.' }, { status: 400 });

    if (!Array.isArray(luggage) || luggage.length === 0) {
      return NextResponse.json(
        { error: 'At least one luggage item is required.' },
        { status: 400 }
      );
    }

    if (!delivery.address) return NextResponse.json({ error: 'Delivery address is required.' }, { status: 400 });
    if (!delivery.recipientName) return NextResponse.json({ error: 'Recipient name is required.' }, { status: 400 });
    if (!delivery.recipientPhone) return NextResponse.json({ error: 'Recipient phone is required.' }, { status: 400 });

    // 4. Connect to Database
    await connectDB();

    // 5. Calculate Totals
    const totalBags = luggage.reduce(
      (sum: number, b: any) => sum + (Number(b.quantity) || 0),
      0
    );

    const totalWeight = luggage.reduce(
      (sum: number, b: any) =>
        sum + ((Number(b.weight) || 0) * (Number(b.quantity) || 0)),
      0
    );

    if (totalBags === 0) {
      return NextResponse.json(
        { error: 'Total bags must be greater than 0.' },
        { status: 400 }
      );
    }

    // 6. Calculate Price
    const priceInfo = calculatePrice({
      pickupCity: pickup.city,
      destinationCity: destination.city,
      totalWeight,
      totalBags,
    });

    // 7. Generate Reference & OTP
    const reference = `LE-${uuidv4().slice(0, 8).toUpperCase()}`;
    const otp = generateOTP();

    // 8. Create Booking
    const booking = await Booking.create({
      reference,
      otp,
      userId: (session.user as any).id,

      pickup: {
        house: pickup.house,
        city: pickup.city,
        state: pickup.state,
        country: pickup.country || 'Nigeria',
        contactName: pickup.contactName,
        contactPhone: pickup.contactPhone,
        date: new Date(pickup.date || Date.now()),
      },

      destination: {
        state: destination.state || '',
        city: destination.city,
        address: destination.address || '',
      },

      delivery: {
        address: delivery.address,
        recipientName: delivery.recipientName,
        recipientPhone: delivery.recipientPhone,
        date: new Date(delivery.date || Date.now()),
        instructions: delivery.instructions || '',
      },

      luggage: luggage.map((b: any) => ({
        type: b.type || 'Suitcase',
        quantity: Number(b.quantity) || 1,
        weight: Number(b.weight) || 0,
        description: b.description || '',
        specialInstructions: b.specialInstructions || '',
      })),

      totalBags,
      totalWeight,
      price: priceInfo.total,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    // 9. Return Success
    return NextResponse.json(
      {
        success: true,
        reference: booking.reference,
        bookingId: booking._id,
        priceBreakdown: priceInfo,
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Booking API Error:', err);

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(
        (e: any) => e.message
      );

      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({
      userId: (session.user as any).id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings });

  } catch (err: any) {
    console.error('Fetch Bookings Error:', err);

    return NextResponse.json(
      { error: 'Unable to fetch bookings.' },
      { status: 500 }
    );
  }
}
