const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

async function sendOTP(to, otp) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "SafeBuddy", email: "noreply@safebuddy.app" };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = "Your SafeBuddy verification code";
  sendSmtpEmail.htmlContent = `
    <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
      <h2 style="color:#6366f1;margin-bottom:8px;">SafeBuddy</h2>
      <p style="color:#94a3b8;margin-bottom:24px;">Your verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#fff;background:#1e293b;padding:20px;border-radius:12px;text-align:center;">${otp}</div>
      <p style="color:#64748b;font-size:13px;margin-top:24px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

module.exports = { sendOTP };
