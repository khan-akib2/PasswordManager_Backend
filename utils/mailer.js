const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(to, otp) {
  await resend.emails.send({
    from: "SafeBuddy <onboarding@resend.dev>",
    to,
    subject: "Your SafeBuddy verification code",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
        <h2 style="color:#6366f1;margin-bottom:8px;">SafeBuddy</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Your verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#fff;background:#1e293b;padding:20px;border-radius:12px;text-align:center;">${otp}</div>
        <p style="color:#64748b;font-size:13px;margin-top:24px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}

module.exports = { sendOTP };
