import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

export const sendAdminNotification = async (payload) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  let subject = "";
  let html = "";

  if (payload.type === "corporate_request") {
    subject = `New Corporate Booking Request - ${payload.name}`;

    html = `
      <h2>New Corporate Booking Inquiry</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Pickup:</strong> ${payload.pickup.name}</p>
      <p><strong>Drop:</strong> ${payload.drop.name}</p>
      <p><strong>Estimated Fare:</strong> ₹${payload.fare}</p>
      <p><strong>Request ID:</strong> ${payload.id}</p>
      <p>You can now contact the client and negotiate pricing.</p>
    `;
  }

  if (payload.type === "corporate_link_generated") {
    subject = `Corporate Payment Link Generated`;

    html = `
      <h2>Payment Link Created</h2>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Request ID:</strong> ${payload.requestId}</p>
      <p><strong>Order ID:</strong> ${payload.orderId}</p>
      <p>Share payment link with the client.</p>
    `;
  }

  await transporter.sendMail({
    from: `"DoorDarshan Travels" <${EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject,
    html,
  });

  return true;
};