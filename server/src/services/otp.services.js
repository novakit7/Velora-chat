import crypto from "crypto";
import transporter from "../utils/nodemailer.js";

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const sendOTP = async ({ email, otp, subject, heading, message }) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject,
    html: `
        <div style="margin:0;padding:40px 20px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,.06);">

            <div style="padding:40px 40px 30px;text-align:center;background:linear-gradient(135deg,#2563eb,#4f46e5);">

            <h1 style="margin:0;color:#ffffff;font-size:34px;font-weight:700;">
                Velora
            </h1>

            <p style="margin:10px 0 0;color:#dbeafe;font-size:15px;">
                Where conversations flow.
            </p>

            </div>

            <div style="padding:40px;">

            <p style="margin:0;color:#111827;font-size:18px;">
                Hello 👋,
            </p>

            <h2 style="margin:18px 0 14px;color:#111827;font-size:28px;">
                ${heading}
            </h2>

            <p style="margin:0;color:#4b5563;font-size:16px;line-height:1.8;">
                ${message}
            </p>

            <div style="margin:35px 0;padding:28px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:14px;text-align:center;">

                <p style="margin:0 0 12px;color:#64748b;font-size:14px;">
                Your One-Time Verification Code
                </p>

                <div style="
                display:inline-block;
                font-size:38px;
                font-weight:700;
                letter-spacing:12px;
                color:#2563eb;
                font-family:monospace;
                ">
                ${otp}
                </div>

            </div>

            <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.8;">
                This code will expire in
                <strong>5 minutes</strong>.
                For your security, never share this code with anyone.
            </p>

            <div style="margin-top:28px;padding:18px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;">

                <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.7;">
                Didn't make this request?<br>
                You can safely ignore this email. Your account will remain secure.
                </p>

            </div>

            <hr style="margin:40px 0 25px;border:none;border-top:1px solid #e5e7eb;">

            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
                Thanks for choosing <strong>Velora</strong>. We're excited to have you with us.
            </p>

            </div>

            <div style="padding:22px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">

            <p style="margin:0;color:#9ca3af;font-size:13px;">
                © ${new Date().getFullYear()} Velora. All rights reserved.
            </p>

            <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
                Built for meaningful conversations.
            </p>

            </div>

        </div>

        </div>
        `,
  });
};

export { generateOTP, sendOTP };
