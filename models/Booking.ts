import mongoose, { Schema, models, model } from 'mongoose';

export interface ILuggageItem {
  type: string;
  quantity: number;
  weight: number;
  description?: string;
  photoUrl?: string;
  specialInstructions?: string;
  trackingCode?: string;
}

export interface IBooking {
  _id?: string;
  reference: string;
  userId: mongoose.Types.ObjectId;
  pickup: {
    house: string;
    city: string;
    state: string;
    country: string;
    contactName: string;
    contactPhone: string;
    date: Date;
  };
  destination: {
    state: string;
    city: string;
    address: string;
  };
  delivery: {
    address: string;
    recipientName: string;
    recipientPhone: string;
    date: Date;
    instructions?: string;
  };
  luggage: ILuggageItem[];
  totalBags: number;
  totalWeight: number;
  price: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'assigned'
    | 'collected'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  driverId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pickup: {
      house: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
      date: { type: Date, required: true },
    },
    destination: {
      state: String,
      city: String,
      address: String,
    },
    delivery: {
      address: { type: String, required: true },
      recipientName: { type: String, required: true },
      recipientPhone: { type: String, required: true },
      date: { type: Date, required: true },
      instructions: String,
    },
    luggage: [
      {
        type: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        weight: { type: Number, required: true, min: 0 },
        description: String,
        photoUrl: String,
        specialInstructions: String,
        trackingCode: String,
      },
    ],
    totalBags: { type: Number, required: true },
    totalWeight: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'collected', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);