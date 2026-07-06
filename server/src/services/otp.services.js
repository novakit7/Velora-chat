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
      <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Velora OTP</title>
<style>
body{Margin:0;padding:0;background:#08131f;}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{border:0;display:block;line-height:100%;}
body,td,p,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:Arial,Helvetica,sans-serif;}
@media only screen and (max-width:600px){
.container{width:100%!important;}
.pad{padding:24px!important;}
.title{font-size:26px!important;}
.logo{font-size:34px!important;}
.otp{font-size:28px!important;letter-spacing:4px!important;padding:14px 18px!important;}
}
</style>
</head>
<body bgcolor="#08131f">

<table role="presentation" width="100%" bgcolor="#08131f" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:32px 16px;">

<table role="presentation" class="container" width="700" cellpadding="0" cellspacing="0" style="width:700px;max-width:700px;background:#122338;border:1px solid #27445d;">

<tr>
<td align="center" bgcolor="#0f1d2e" style="padding:42px 30px;border-bottom:1px solid #27445d;">
<div class="logo" style="font-size:40px;font-family:Georgia,serif;font-weight:bold;color:#ffffff;">Velora</div>
<div style="margin-top:10px;color:#9fb2c7;font-size:15px;">Meaningful conversations. Beautifully connected.</div>
</td>
</tr>

<tr>
<td class="pad" style="padding:48px 56px;">

<p style="Margin:0;font-size:17px;color:#d8e1eb;">Hello &#128075;,</p>

<h2 class="title" style="Margin:18px 0;color:#ffffff;font-size:32px;font-weight:bold;">
${heading}
</h2>

<p style="Margin:0;color:#b8c6d8;font-size:16px;line-height:28px;">
${message}
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="Margin-top:36px;background:#0d1b2a;border:1px solid #27445d;">
<tr>
<td align="center" style="padding:32px;">

<p style="Margin:0 0 16px;color:#9fb2c7;font-size:14px;">
Your One-Time Verification Code
</p>

<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td class="otp" style="padding:18px 30px;border:1px solid #14b8a6;background:#08131f;color:#14b8a6;font-size:36px;font-family:Courier New,monospace;font-weight:bold;letter-spacing:6px;">
${otp}
</td>
</tr>
</table>

</td>
</tr>
</table>

<p style="Margin:32px 0 0;color:#b8c6d8;font-size:15px;line-height:28px;">
This verification code will expire in <strong style="color:#ffffff;">5 minutes</strong>. Never share this code with anyone, including Velora support.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="Margin-top:30px;border-left:4px solid #14b8a6;background:#173047;">
<tr>
<td style="padding:20px;">
<p style="Margin:0;color:#d8e1eb;font-size:14px;line-height:24px;">
<strong style="color:#22d3ee;">Security Notice</strong><br><br>
Didn't request this verification code? You can safely ignore this email. Your account will remain secure, and no action is required.
</p>
</td>
</tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="Margin:40px 0 24px;">
<tr><td style="border-top:1px solid #27445d;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>

<p style="Margin:0;color:#b8c6d8;font-size:15px;line-height:28px;">
Thanks for choosing <strong style="color:#14b8a6;">Velora</strong>. We're excited to have you as part of our community.
</p>

</td>
</tr>

<tr>
<td align="center" bgcolor="#0f1d2e" style="padding:24px;border-top:1px solid #27445d;">
<p style="Margin:0;color:#94a3b8;font-size:13px;">&copy; ${new Date().getFullYear()} Velora. All rights reserved.</p>
<p style="Margin:8px 0 0;color:#64748b;font-size:12px;">Built with &#10084;&#65039; for meaningful conversations.</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
          `,
  });
};

export { generateOTP, sendOTP };
