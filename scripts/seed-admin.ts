import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing from .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    staffId: { type: String, unique: true, sparse: true },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ADMIN = {
  name: 'System Admin',
  email: 'haifan22@gmail.com',
  password: 'Admin@12345',
  phone: '+2348000000000',
  role: 'admin' as const,
};

async function main() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { dbName: 'luggag-ease' });
  console.log('✅ Connected\n');

  const hashed = await bcrypt.hash(ADMIN.password, 10);
  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    existing.name = ADMIN.name;
    existing.password = hashed;
    existing.role = ADMIN.role;
    existing.emailVerified = true;
    existing.phoneVerified = true;
    await existing.save();
    console.log('♻️  Admin already existed — password reset');
  } else {
    await User.create({
      name: ADMIN.name,
      email: ADMIN.email,
      password: hashed,
      phone: ADMIN.phone,
      role: ADMIN.role,
      emailVerified: true,
      phoneVerified: true,
    });
    console.log('✅ Admin created');
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ADMIN CREDENTIALS (save these now):');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Email:    ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});