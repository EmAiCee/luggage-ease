import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: 'luggag-ease' });

  const collection = mongoose.connection.db!.collection('bookings');
  const bookings = await collection.find({}).sort({ createdAt: -1 }).limit(5).toArray();

  console.log(`\n📊 Found ${bookings.length} recent booking(s)\n`);
  console.log('═══════════════════════════════════════════════════════════');

  for (const b of bookings) {
    console.log(`\nReference: ${b.reference}`);
    console.log(`  Status:        ${b.status}`);
    console.log(`  Payment:       ${b.paymentStatus}`);
    console.log(`  OTP:           ${b.otp ?? '❌ MISSING'}`);
    console.log(`  has paidAt:    ${b.paidAt ? '✅' : '❌'}`);
    console.log(`  has assignedDriver: ${b.assignedDriver ? '✅' : '❌'}`);
    console.log(`  All fields:    ${Object.keys(b).join(', ')}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});