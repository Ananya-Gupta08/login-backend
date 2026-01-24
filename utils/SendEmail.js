const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  const result = await resend.emails.send({
    from: "Login App <onboarding@resend.dev>",
    to: [to],
    subject,
    text,
  });

  console.log("RESEND RESULT:", result);
};

module.exports = sendEmail;
