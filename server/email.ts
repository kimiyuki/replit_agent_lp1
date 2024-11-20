import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SendGrid API キーが設定されていません');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  name: string;
}

export async function sendConfirmationEmail({ to, name }: EmailParams) {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com', // SendGridで認証済みのアドレス
      subject: 'お問い合わせありがとうございます',
      text: `${name} 様

お問い合わせいただき、ありがとうございます。
以下の内容で承りました。

担当者より順次ご連絡させていただきますので、
今しばらくお待ちくださいませ。

※このメールは自動送信されています。
このメールに返信いただいてもお答えできない場合がございます。`,
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

    await sgMail.send(msg);
  } catch (error) {
    console.error('メール送信エラー:', error);
    throw new Error('メール送信に失敗しました。お問い合わせ内容は保存されましたので、後ほど担当者よりご連絡させていただきます。');
  }
}
