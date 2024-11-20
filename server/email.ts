import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SendGrid API キーが設定されていません');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to?: string;  // Make optional for template processing
  name: string;
  email?: string;
  subject: string;
  company: string;
  department: string;
  message: string;
}

// Template types enum
enum EmailTemplateType {
  CONFIRMATION = 'CONFIRMATION',
  ADMIN_NOTIFICATION = 'ADMIN_NOTIFICATION',
}

// Base template interface
interface BaseEmailTemplate {
  subject: string;
  textTemplate: string;
  htmlTemplate: string;
}

// Extended template interfaces with conditional sections
interface EmailTemplate extends BaseEmailTemplate {
  conditions?: {
    [key: string]: {
      check: (params: EmailParams) => boolean;
      content: {
        text: string;
        html: string;
      };
    };
  };
}

// Template configuration type
type TemplateConfig = {
  [key in EmailTemplateType]: EmailTemplate;
};

// Style configurations for HTML templates
const emailStyles = {
  container: 'font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;',
  header: 'margin-bottom: 24px;',
  content: 'margin: 2em 0; padding: 1.5em; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;',
  label: 'font-weight: bold; color: #495057; margin-bottom: 0.5em;',
  value: 'margin-left: 0; margin-bottom: 1.5em; color: #212529;',
  footer: 'margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 0.9em;',
};

// Default templates configuration
const defaultTemplates: TemplateConfig = {
  [EmailTemplateType.CONFIRMATION]: {
    subject: 'お問い合わせありがとうございます',
    textTemplate: `{name} 様

お問い合わせいただき、ありがとうございます。
以下の内容で承りました。

【件名】
{subject}

{if:company}【会社名】
{company}{endif:company}

{if:department}【部署名】
{department}{endif:department}

【お問い合わせ内容】
{message}

担当者より順次ご連絡させていただきますので、
今しばらくお待ちくださいませ。

※このメールは自動送信されています。
このメールに返信いただいてもお答えできない場合がございます。`,
    htmlTemplate: `
      <div style="{styles.container}">
        <div style="{styles.header}">
          <h2>{name} 様</h2>
          <p>お問い合わせいただき、ありがとうございます。<br>
          以下の内容で承りました。</p>
        </div>

        <div style="{styles.content}">
          <dl>
            <dt style="{styles.label}">【件名】</dt>
            <dd style="{styles.value}">{subject}</dd>
            
            {if:company}
            <dt style="{styles.label}">【会社名】</dt>
            <dd style="{styles.value}">{company}</dd>
            {endif:company}
            
            {if:department}
            <dt style="{styles.label}">【部署名】</dt>
            <dd style="{styles.value}">{department}</dd>
            {endif:department}
            
            <dt style="{styles.label}">【お問い合わせ内容】</dt>
            <dd style="{styles.value}">{message}</dd>
          </dl>
        </div>

        <div style="{styles.footer}">
          <p>担当者より順次ご連絡させていただきますので、<br>
          今しばらくお待ちくださいませ。</p>
          <p>※このメールは自動送信されています。<br>
          このメールに返信いただいてもお答えできない場合がございます。</p>
        </div>
      </div>
    `
  },
  [EmailTemplateType.ADMIN_NOTIFICATION]: {
    subject: '新規お問い合わせ通知',
    textTemplate: `新規のお問い合わせがありました。

【件名】
{subject}

【名前】
{name}

【メールアドレス】
{email}

{if:company}【会社名】
{company}{endif:company}

{if:department}【部署名】
{department}{endif:department}

【お問い合わせ内容】
{message}

管理画面から確認してください。`,
    htmlTemplate: `
      <div style="{styles.container}">
        <div style="{styles.header}">
          <h2>新規のお問い合わせ</h2>
        </div>

        <div style="{styles.content}">
          <dl>
            <dt style="{styles.label}">【件名】</dt>
            <dd style="{styles.value}">{subject}</dd>

            <dt style="{styles.label}">【名前】</dt>
            <dd style="{styles.value}">{name}</dd>

            <dt style="{styles.label}">【メールアドレス】</dt>
            <dd style="{styles.value}">{email}</dd>
            
            {if:company}
            <dt style="{styles.label}">【会社名】</dt>
            <dd style="{styles.value}">{company}</dd>
            {endif:company}
            
            {if:department}
            <dt style="{styles.label}">【部署名】</dt>
            <dd style="{styles.value}">{department}</dd>
            {endif:department}
            
            <dt style="{styles.label}">【お問い合わせ内容】</dt>
            <dd style="{styles.value}">{message}</dd>
          </dl>
        </div>

        <div style="{styles.footer}">
          <p>管理画面から確認してください。</p>
        </div>
      </div>
    `
  }
};

// Template processing functions
function getTemplateFromEnv(type: EmailTemplateType): EmailTemplate {
  const typeKey = type.toString();
  return {
    subject: process.env[`EMAIL_TEMPLATE_SUBJECT_${typeKey}`] || defaultTemplates[type].subject,
    textTemplate: process.env[`EMAIL_TEMPLATE_TEXT_${typeKey}`] || defaultTemplates[type].textTemplate,
    htmlTemplate: process.env[`EMAIL_TEMPLATE_HTML_${typeKey}`] || defaultTemplates[type].htmlTemplate,
  };
}

function processConditionalSections(template: string, params: Omit<EmailParams, 'to'>): string {
  let processedTemplate = template;
  
  // Process if conditions
  const conditionalPattern = /{if:(\w+)}([\s\S]*?){endif:\1}/g;
  processedTemplate = processedTemplate.replace(conditionalPattern, (_, key, content) => {
    const value = params[key as keyof Omit<EmailParams, 'to'>];
    return value ? content : '';
  });
  
  return processedTemplate;
}

function processTemplateVariables(template: string, params: Omit<EmailParams, 'to'>): string {
  // First, replace style placeholders
  let processedTemplate = template.replace(/{styles\.(\w+)}/g, (_, key) => emailStyles[key as keyof typeof emailStyles]);
  
  // Then, replace content variables
  const replacements = {
    '{name}': params.name,
    '{email}': params.email || '',
    '{subject}': params.subject,
    '{company}': params.company || "（未入力）",
    '{department}': params.department || "（未入力）",
    '{message}': params.message,
  };

  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(new RegExp(key, 'g'), value),
    processedTemplate
  );
}

async function sendEmail(params: Required<Pick<EmailParams, 'to'>> & EmailParams & { type: EmailTemplateType }) {
  const { to, type, ...templateParams } = params;
  
  try {
    // Get template based on type
    const template = getTemplateFromEnv(type);
    
    // Process template with conditions and variables
    const processTemplate = (rawTemplate: string) => {
      const withConditions = processConditionalSections(rawTemplate, templateParams);
      return processTemplateVariables(withConditions, templateParams);
    };

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: processTemplateVariables(template.subject, templateParams),
      text: processTemplate(template.textTemplate),
      html: processTemplate(template.htmlTemplate),
    };

    await sgMail.send(msg);
    console.log(`メール送信成功 (${type}): ${to}`);
  } catch (error) {
    console.error(`メール送信エラー (${type}): Details:`, error);
    throw error;
  }
}

export async function sendConfirmationEmail(params: Required<Pick<EmailParams, 'to'>> & Omit<EmailParams, 'to'>) {
  await sendEmail({ ...params, type: EmailTemplateType.CONFIRMATION });
  
  // Also send admin notification if ADMIN_EMAIL is configured
  if (process.env.ADMIN_EMAIL) {
    try {
      await sendEmail({
        ...params,
        to: process.env.ADMIN_EMAIL,
        type: EmailTemplateType.ADMIN_NOTIFICATION,
      });
    } catch (error) {
      console.error('管理者通知メール送信エラー:', error);
      // Don't throw error for admin notification failure
    }
  }
}
