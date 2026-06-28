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
        <div
      style="
        margin: 0;
        padding: 40px 20px;
        background: #08131f;
        font-family: Arial, Helvetica, sans-serif;
      "
    >
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="
          max-width: 620px;
          margin: auto;
          background: #122338;
          border: 1px solid #27445d;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.45);
        "
      >
        <tr>
          <td
            align="center"
            style="
              padding: 50px 30px;
              background:
                radial-gradient(
                  circle at top left,
                  rgba(20, 184, 166, 0.18),
                  transparent 45%
                ),
                radial-gradient(
                  circle at top right,
                  rgba(34, 211, 238, 0.12),
                  transparent 40%
                ),
                linear-gradient(135deg, #08131f, #0f1d2e, #16263a);
              border-bottom: 1px solid #27445d;
            "
          >
            <h1
              style="
                margin: 0;
                font-family: Palatino, &quot;Book Antiqua&quot;, Georgia, serif;
                font-size: 42px;
                font-weight: bold;
                letter-spacing: 1.5px;
                color: #f8fafc;
              "
            >
              Velora
            </h1>

            <p
              style="
                margin: 12px 0 0;
                font-size: 15px;
                color: #94a3b8;
                line-height: 1.6;
              "
            >
              Meaningful conversations. Beautifully connected.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 42px">
            <p style="margin: 0; color: #cbd5e1; font-size: 17px">Hello 👋,</p>

            <h2
              style="
                margin: 18px 0;
                color: #f8fafc;
                font-size: 30px;
                font-weight: 700;
              "
            >
              ${heading}
            </h2>

            <p
              style="
                margin: 0;
                color: #94a3b8;
                font-size: 16px;
                line-height: 1.8;
              "
            >
              ${message}
            </p>

            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              style="
                margin: 38px 0;
                background: #0f1d2e;
                border: 1px solid #27445d;
                border-radius: 16px;
              "
            >
              <tr>
                <td align="center" style="padding: 34px">
                  <p style="margin: 0; color: #94a3b8; font-size: 14px">
                    Your One-Time Verification Code
                  </p>

                  <div
                    style="
                      display: inline-block;
                      margin-top: 20px;
                      padding: 16px 28px;
                      background: #08131f;
                      border: 1px solid #355675;
                      border-radius: 12px;
                      font-size: 42px;
                      font-family: monospace;
                      font-weight: 700;
                      letter-spacing: 12px;
                      color: #14b8a6;
                      box-shadow: 0 0 20px rgba(20, 184, 166, 0.18);
                    "
                  >
                    ${otp}
                  </div>
                </td>
              </tr>
            </table>

            <p
              style="
                margin: 0;
                color: #94a3b8;
                font-size: 15px;
                line-height: 1.8;
              "
            >
              This verification code will expire in
              <strong style="color: #f8fafc">5 minutes</strong>. Never share
              this code with anyone, including Velora support.
            </p>

            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              style="
                margin-top: 30px;
                background: #112437;
                border-left: 4px solid #14b8a6;
                border-radius: 10px;
              "
            >
              <tr>
                <td style="padding: 20px">
                  <p
                    style="
                      margin: 0;
                      color: #cbd5e1;
                      font-size: 14px;
                      line-height: 1.8;
                    "
                  >
                    <strong style="color: #22d3ee"> Security Notice </strong>
                    <br /><br />

                    Didn't request this verification code? You can safely ignore
                    this email. Your account will remain secure, and no action
                    is required.
                  </p>
                </td>
              </tr>
            </table>

            <hr
              style="
                margin: 40px 0;
                border: none;
                border-top: 1px solid #27445d;
              "
            />

            <p
              style="
                margin: 0;
                color: #94a3b8;
                font-size: 15px;
                line-height: 1.8;
              "
            >
              Thanks for choosing
              <strong style="color: #14b8a6"> Velora </strong>. We're excited to
              have you as part of our community.
            </p>
          </td>
        </tr>

        <tr>
          <td
            align="center"
            style="
              padding: 26px;
              background: #08131f;
              border-top: 1px solid #27445d;
            "
          >
            <p style="margin: 0; color: #94a3b8; font-size: 13px">
              © ${new Date().getFullYear()} Velora. All rights reserved.
            </p>

            <p style="margin: 10px 0 0; color: #64748b; font-size: 12px">
              Built with ❤️ for meaningful conversations.
            </p>
          </td>
        </tr>
      </table>
    </div>
        `,
  });
};

export { generateOTP, sendOTP };
