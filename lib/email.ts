import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER!;
const ADMIN = process.env.ADMIN_EMAIL!;

const BRAND_COLOR = '#143D2E';
const ORANGE = '#EF8E3D';

function wrap(content: string): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid ${BRAND_COLOR};">
        <h1 style="color: ${BRAND_COLOR}; margin: 0; font-size: 24px;">
          Luggage<span style="color: ${ORANGE};">Ease</span>
        </h1>
        <p style="color: #666; font-size: 12px; margin: 4px 0 0;">You Travel. We Handle Your Luggage.</p>
      </div>
      <div style="padding: 24px 0;">${content}</div>
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LuggageEase. All rights reserved.
      </div>
    </div>
  `;
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_PASS) {
    console.log(`📧 [Email skipped — no EMAIL_PASS] To: ${to} | ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`📧 Email sent → ${to}: ${subject}`);
  } catch (err) {
    console.error('📧 Email failed:', err);
  }
}

// 1. Booking created → customer
export async function sendBookingCreatedEmail(to: string, reference: string, otp: string) {
  const html = wrap(`
    <h2 style="color: ${BRAND_COLOR};">Booking Confirmed 🎉</h2>
    <p>Your booking has been created successfully.</p>
    <div style="background: #FDFBF7; padding: 16px; border-left: 4px solid ${ORANGE}; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Reference:</strong> <code>${reference}</code></p>
      <p style="margin: 4px 0;"><strong>Delivery OTP:</strong> <code style="font-size: 18px; color: ${BRAND_COLOR};">${otp}</code></p>
    </div>
    <p style="font-size: 13px; color: #666;">
      Keep this OTP safe. You'll need to share it with the driver upon delivery.
    </p>
  `);
  await send(to, `Booking ${reference} confirmed`, html);
}

// 2. Payment confirmed → admin
export async function sendPaymentConfirmedAdminEmail(reference: string, amount: number) {
  const html = wrap(`
    <h2 style="color: ${BRAND_COLOR};">New Paid Booking — Assign a Driver</h2>
    <p>A customer just paid for a booking. Please log in and assign a driver.</p>
    <div style="background: #FDFBF7; padding: 16px; border-left: 4px solid ${ORANGE}; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Reference:</strong> ${reference}</p>
      <p style="margin: 4px 0;"><strong>Amount:</strong> ₦${amount.toLocaleString('en-NG')}</p>
    </div>
    <p><a href="${process.env.NEXTAUTH_URL}/admin" style="display: inline-block; background: ${ORANGE}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Open Admin Panel</a></p>
  `);
  await send(ADMIN, `💰 Payment received for ${reference}`, html);
}

// 3. Luggage collected → customer
export async function sendCollectedEmail(to: string, reference: string) {
  const html = wrap(`
    <h2 style="color: ${BRAND_COLOR};">Your Luggage Has Been Collected ✅</h2>
    <p>Good news! Our driver has collected your luggage and it's now in safe hands.</p>
    <div style="background: #FDFBF7; padding: 16px; border-left: 4px solid ${ORANGE}; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Reference:</strong> ${reference}</p>
    </div>
    <p>You can track its progress anytime at <a href="${process.env.NEXTAUTH_URL}/track">${process.env.NEXTAUTH_URL}/track</a></p>
  `);
  await send(to, `Luggage ${reference} collected`, html);
}

// 4. Luggage delivered → customer
export async function sendDeliveredEmail(to: string, reference: string) {
  const html = wrap(`
    <h2 style="color: ${BRAND_COLOR};">Delivered! 🎉</h2>
    <p>Your luggage has been successfully delivered to the recipient.</p>
    <div style="background: #FDFBF7; padding: 16px; border-left: 4px solid ${ORANGE}; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Reference:</strong> ${reference}</p>
    </div>
    <p>Thank you for using LuggageEase. We'd love your feedback!</p>
  `);
  await send(to, `Luggage ${reference} delivered`, html);
}
// 5. Driver assigned → notify the driver
export async function sendDriverAssignedEmail(
  to: string,
  driverName: string,
  reference: string,
  pickup: { house: string; city: string; state: string },
  delivery: { address: string; recipientName: string; recipientPhone: string },
  scheduledDate: Date
) {
  const html = wrap(`
    <h2 style="color: ${BRAND_COLOR};">You have a new assignment 🚚</h2>
    <p>Hello ${driverName},</p>
    <p>You have been assigned to the following luggage delivery:</p>
    <div style="background: #FDFBF7; padding: 16px; border-left: 4px solid ${ORANGE}; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Reference:</strong> ${reference}</p>
      <p style="margin: 4px 0;"><strong>Pickup Address:</strong> ${pickup.house}, ${pickup.city}, ${pickup.state}</p>
      <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${delivery.address}</p>
      <p style="margin: 4px 0;"><strong>Recipient:</strong> ${delivery.recipientName} · ${delivery.recipientPhone}</p>
      <p style="margin: 4px 0;"><strong>Scheduled Delivery:</strong> ${scheduledDate.toLocaleDateString('en-NG')}</p>
    </div>
    <p>Log in to your driver portal to view full details and start the delivery.</p>
    <p><a href="${process.env.NEXTAUTH_URL}/driver" style="display: inline-block; background: ${ORANGE}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Open Driver Portal</a></p>
  `);
  await send(to, `New assignment: ${reference}`, html);
}