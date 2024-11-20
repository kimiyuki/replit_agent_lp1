import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailParams {
  to: string;
  name: string;
}

export async function sendConfirmationEmail({ to, name }: EmailParams) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: "お問い合わせありがとうございます",
    text: `
${name} 様

お問い合わせいただき、ありがとうございます。
以下の内容で承りました。

担当者より順次ご連絡させていただきますので、
今しばらくお待ちくださいませ。

※このメールは自動送信されています。
このメールに返信いただいてもお答えできない場合がございます。
    `,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${name} 様</h2>
        <p>お問い合わせいただき、ありがとうございます。<br>
        以下の内容で承りました。</p>
        <p>担当者より順次ご連絡させていただきますので、<br>
        今しばらくお待ちくださいませ。</p>
        <hr style="margin: 2em 0;">
        <p style="color: #666; font-size: 0.9em;">
          ※このメールは自動送信されています。<br>
          このメールに返信いただいてもお答えできない場合がございます。
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
