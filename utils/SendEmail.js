import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendTicketClosedEmail = async (toEmail) => {
  const msg = {
    to: toEmail,
    from: process.env.EMAIL_USER,
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

  const info = await sgMail.send(msg);
  return info;
};

export default sendTicketClosedEmail;
