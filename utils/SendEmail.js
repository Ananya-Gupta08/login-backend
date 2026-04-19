import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTicketClosedEmail = async (toEmail) => {
  const mailOptions = {
    from: `Support Team <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Ticket Has Been Closed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <p>Hello,</p>
        <p>Your ticket has been closed successfully.</p>
        <p>Thank you for reaching out to our support team.</p>
        <p>Best regards,<br/>Support Team</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendTicketClosedEmail;
