const nodemailer = require("nodemailer");

const createTransporter = async () => {
  // 1. Direct Gmail configuration (User + App Password)
  const gmailUser = process.env.GMAIL_USER || (process.env.SMTP_HOST?.includes("gmail.com") ? process.env.SMTP_USER : null);
  const gmailPass = (process.env.GMAIL_PASS || (process.env.SMTP_HOST?.includes("gmail.com") ? process.env.SMTP_PASS : null))?.replace(/\s+/g, "");

  if (gmailUser && gmailPass && !gmailPass.includes("your_") && !gmailUser.includes("your_")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  // 2. Custom SMTP configuration (SendGrid, Mailgun, Brevo, AWS SES, or custom SMTP)
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !process.env.SMTP_USER.includes("your_") &&
    !process.env.SMTP_PASS.includes("your_")
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
};

const sendVerificationEmail = async ({ to, name, token, otp, baseUrl }) => {
  const appUrl = baseUrl || process.env.APP_URL || "http://localhost:3000";
  const verifyLink = `${appUrl.replace(/\/$/, "")}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
  
  const senderEmail = process.env.GMAIL_USER || (process.env.SMTP_USER && !process.env.SMTP_USER.includes("your_") ? process.env.SMTP_USER : null);
  const fromAddress = process.env.SMTP_FROM || (senderEmail ? `"Task Master" <${senderEmail}>` : `"Task Master" <no-reply@protask.com>`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; text-align: left; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .code-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca; margin: 8px 0; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin: 20px 0; text-align: center; font-size: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .link-text { word-break: break-all; color: #6366f1; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Task Master</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || "there"},</div>
          <p>Thank you for creating an account with Task Master! Please confirm your real email address to complete your registration and secure your account.</p>
          
          <div class="code-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 1px;">Your 6-Digit Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div style="font-size: 12px; color: #64748b;">Expires in 15 minutes</div>
          </div>

          <div style="text-align: center;">
            <a href="${verifyLink}" class="btn" target="_blank">Confirm Email Address</a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            Or click this verification link directly:<br>
            <a href="${verifyLink}" class="link-text">${verifyLink}</a>
          </p>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you didn't create an account with Task Master, please disregard this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Task Master. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = await createTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `[${otp}] Your Task Master Verification Code`,
        text: `Hello ${name}, your 6-digit confirmation code is ${otp}. Alternatively click here to verify: ${verifyLink}`,
        html: htmlContent,
      });

      console.log(`[Email Service] Live verification email successfully delivered to ${to} (Message ID: ${info.messageId})`);
      return {
        success: true,
        delivered: true,
        messageId: info.messageId,
      };
    } else {
      console.warn(`\n[Email Service Warning]: No outgoing Gmail/SMTP credentials set in .env!`);
      console.warn(`Generated OTP code for ${to}: ${otp}\n`);
      return {
        success: false,
        delivered: false,
        reason: "SMTP_NOT_CONFIGURED",
      };
    }
  } catch (error) {
    console.error(`[Email Service Error sending to ${to}]:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendContactEmail = async ({ name, email, subject, message, userRole }) => {
  const adminEmail = process.env.ADMIN_CONTACT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER || "yassinekalthoum94@gmail.com";
  const senderEmail = process.env.GMAIL_USER || (process.env.SMTP_USER && !process.env.SMTP_USER.includes("your_") ? process.env.SMTP_USER : null);
  const fromAddress = process.env.SMTP_FROM || (senderEmail ? `"Task Master Contact" <${senderEmail}>` : `"Task Master Contact" <no-reply@protask.com>`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 28px 24px; text-align: left; line-height: 1.6; }
        .field { margin-bottom: 14px; }
        .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        .val { font-size: 15px; color: #0f172a; font-weight: 500; }
        .msg-box { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 18px 0; font-size: 14px; color: #334155; white-space: pre-wrap; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Message</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="val">${name}</div>
          </div>
          <div class="field">
            <div class="label">Reply-To Email</div>
            <div class="val"><a href="mailto:${email}" style="color: #4f46e5;">${email}</a></div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="val">${subject || "Inquiry from Task Master"}</div>
          </div>
          ${userRole ? `
          <div class="field">
            <div class="label">User Role</div>
            <div class="val">${userRole}</div>
          </div>` : ''}
          <div class="field">
            <div class="label">Message Content</div>
            <div class="msg-box">${message}</div>
          </div>
        </div>
        <div class="footer">
          Received via Task Master Contact Form &bull; ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = await createTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        replyTo: email,
        subject: `[Contact Form] ${subject || "New Message"} - from ${name}`,
        text: `New contact inquiry from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: htmlContent,
      });

      console.log(`[Email Service] Contact form email delivered to admin (Message ID: ${info.messageId})`);
      return { success: true, delivered: true, messageId: info.messageId };
    } else {
      console.log(`[Contact Form Received locally]: From: ${name} <${email}>, Subject: ${subject}`);
      return { success: true, delivered: false, reason: "SMTP_NOT_CONFIGURED" };
    }
  } catch (error) {
    console.error(`[Contact Email Error]:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendContactEmail,
};
