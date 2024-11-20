import { z } from "zod";

// Japanese validation error messages
export const zodCustomErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      return { message: "文字列を入力してください" };
    }
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") {
      return { message: "入力は必須です" };
    }
  }
  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === "email") {
      return { message: "有効なメールアドレスを入力してください" };
    }
  }

  // Default error message
  return { message: ctx.defaultError };
};

// Phone number validation regex for Japanese format
export const phoneRegex = /^(0[0-9]{1,4}-[0-9]{1,4}-[0-9]{4}|0[0-9]{9,10})$/;

// Form validation schema with Japanese messages
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("正しいメールアドレス形式で入力してください"),
  phone: z
    .string()
    .regex(phoneRegex, "正しい電話番号形式で入力してください")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(1, "お問い合わせ内容は必須です")
    .max(1000, "お問い合わせ内容は1000文字以内で入力してください"),
});

// Custom error formatting for form validation
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.errors.reduce((acc, error) => {
    const path = error.path.join(".");
    acc[path] = error.message;
    return acc;
  }, {} as Record<string, string>);
};

// Custom email validation
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

// Japanese specific text input validation
export const validateJapaneseText = (text: string): boolean => {
  // Allow Japanese characters (Hiragana, Katakana, Kanji), alphanumeric, and basic punctuation
  const japaneseTextRegex = /^[ぁ-んァ-ンー一-龠A-Za-z0-9\s.,!?-]*$/;
  return japaneseTextRegex.test(text);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Error message mapping for common validation scenarios
export const errorMessages = {
  required: "この項目は必須です",
  invalidEmail: "正しいメールアドレスを入力してください",
  invalidPhone: "正しい電話番号を入力してください",
  tooLong: (field: string, max: number) => 
    `${field}は${max}文字以内で入力してください`,
  tooShort: (field: string, min: number) => 
    `${field}は${min}文字以上で入力してください`,
  invalidFormat: "入力形式が正しくありません",
  serverError: "サーバーエラーが発生しました",
  networkError: "通信エラーが発生しました",
};

// Form field validation helper
export const validateField = (
  value: string, 
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    isEmail?: boolean;
    isPhone?: boolean;
  }
): string | null => {
  if (options.required && !value) {
    return errorMessages.required;
  }

  if (options.minLength && value.length < options.minLength) {
    return errorMessages.tooShort(fieldName, options.minLength);
  }

  if (options.maxLength && value.length > options.maxLength) {
    return errorMessages.tooLong(fieldName, options.maxLength);
  }

  if (options.isEmail && !validateEmail(value)) {
    return errorMessages.invalidEmail;
  }

  if (options.isPhone && !phoneRegex.test(value)) {
    return errorMessages.invalidPhone;
  }

  if (options.pattern && !options.pattern.test(value)) {
    return errorMessages.invalidFormat;
  }

  return null;
};
