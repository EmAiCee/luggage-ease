import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email?: string;
  staffId?: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'driver' | 'admin';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  mustChangePassword?: boolean;
  image?: string;
  addresses?: Array<{
    label: string;
    house: string;
    city: string;
    state: string;
    country: string;
    isDefault?: boolean;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    staffId: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, select: false },
    phone: { type: String },
    role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    image: { type: String },
    addresses: [
      {
        label: String,
        house: String,
        city: String,
        state: String,
        country: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);