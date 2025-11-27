import nodemailer from "nodemailer"

export const sendEmailOTP = async (email, otp) => {
  console.log(otp, 'otp')
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    console.log(`[EMAIL Fallback] OTP ${otp} → ${email}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: email,
    subject: "Your verification code",
    text: `Your OTP is ${otp}`,
    html: `<p>Your OTP is <b>${otp}</b></p>`,
  });
};