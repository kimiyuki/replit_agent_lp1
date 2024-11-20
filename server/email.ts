import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SendGrid API キーが設定されていません');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  name: string;
  subject: string;
  company: string;
  department: string;
  message: string;
}

interface EmailTemplate {
  subject: string;
  textTemplate: string;
  htmlTemplate: string;
}

// Default email template
const defaultTemplate: EmailTemplate = {
  subject: 'お問い合わせありがとうございます',
  textTemplate: `{name} 様

お問い合わせいただき、ありがとうございます。
以下の内容で承りました。

【件名】
{subject}

【会社名】
{company}

【部署名】
{department}

【お問い合わせ内容】
{message}

担当者より順次ご連絡させていただきますので、
今しばらくお待ちくださいませ。

※このメールは自動送信されています。
このメールに返信いただいてもお答えできない場合がございます。`,
  htmlTemplate: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>{name} 様</h2>
      <p>お問い合わせいただき、ありがとうございます。<br>
      以下の内容で承りました。</p>

      <dl style="margin: 2em 0; padding: 1em; background: #f8f9fa; border-radius: 4px;">
        <dt style="font-weight: bold; margin-bottom: 0.5em;">【件名】</dt>
        <dd style="margin-left: 0; margin-bottom: 1.5em;">{subject}</dd>
        
        <dt style="font-weight: bold; margin-bottom: 0.5em;">【会社名】</dt>
        <dd style="margin-left: 0; margin-bottom: 1.5em;">{company}</dd>
        
        <dt style="font-weight: bold; margin-bottom: 0.5em;">【部署名】</dt>
        <dd style="margin-left: 0; margin-bottom: 1.5em;">{department}</dd>
        
        <dt style="font-weight: bold; margin-bottom: 0.5em;">【お問い合わせ内容】</dt>
        <dd style="margin-left: 0; margin-bottom: 1.5em; white-space: pre-wrap;">{message}</dd>
      </dl>

      <p>担当者より順次ご連絡させていただきますので、<br>
      今しばらくお待ちくださいませ。</p>
      <hr style="margin: 2em 0;">
      <p style="color: #666; font-size: 0.9em;">
        ※このメールは自動送信されています。<br>
        このメールに返信いただいてもお答えできない場合がございます。
      </p>
    </div>
  `
};

export async function sendConfirmationEmail({ to, name, subject, company, department, message }: EmailParams) {
  try {
    // Get custom template from environment variables or use default
    const customTemplate: EmailTemplate = {
      subject: process.env.EMAIL_TEMPLATE_SUBJECT || defaultTemplate.subject,
      textTemplate: process.env.EMAIL_TEMPLATE_TEXT || defaultTemplate.textTemplate,
      htmlTemplate: process.env.EMAIL_TEMPLATE_HTML || defaultTemplate.htmlTemplate,
    };

    // Replace template variables
    const replacements = {
      '{name}': name,
      '{subject}': subject,
      '{company}': company || "（未入力）",
      '{department}': department || "（未入力）",
      '{message}': message,
    };

    const processTemplate = (template: string) => {
      return Object.entries(replacements).reduce(
        (text, [key, value]) => text.replace(new RegExp(key, 'g'), value),
        template
      );
    };

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: customTemplate.subject,
      text: processTemplate(customTemplate.textTemplate),
      html: processTemplate(customTemplate.htmlTemplate),
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('メール送信エラー:', error);
    throw new Error('メール送信に失敗しました。お問い合わせ内容は保存されましたので、後ほど担当者よりご連絡させていただきます。');
  }
}
