import * as z from "zod";

const AuthFormSchema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter uzunluğunda olmalıdır")
    .max(25, "Kullanıcı adı 20 karakteri geçmemelidir"),
  email: z.email("Geçersiz e-posta adresi"),
  password: z.string().min(8, "Şifre en az 8 karakter uzunluğunda olmalıdır"),
  loginPassword: z.string(),
  confirm: z.string().min(1, "Şifre onayı gerekli"),
  captchaToken: z.string().min(500, "Token çok kısa").max(5000, "Token çok uzun").optional(),
});

const RegisterFormSchema = AuthFormSchema.omit({ loginPassword: true }).refine(
  (data) => data.password === data.confirm,
  {
    message: "Şifreler eşleşmiyor",
    path: ["confirm"],
  },
);

const LoginFormSchema = AuthFormSchema.pick({
  email: true,
  loginPassword: true,
  captchaToken: true,
});

const ForgotPasswordFormSchema = AuthFormSchema.pick({ email: true, captchaToken: true });

const ResetPasswordFormSchema = AuthFormSchema.pick({
  password: true,
  confirm: true,
  captchaToken: true,
}).refine((data) => data.password === data.confirm, {
  message: "Şifreler eşleşmiyor",
  path: ["confirm"],
});

type AuthFormInput = z.infer<typeof AuthFormSchema>;
type RegisterFormInput = z.infer<typeof RegisterFormSchema>;
type LoginFormInput = z.infer<typeof LoginFormSchema>;
type ForgotPasswordFormInput = z.infer<typeof ForgotPasswordFormSchema>;
type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

export {
  AuthFormSchema,
  RegisterFormSchema,
  LoginFormSchema,
  ForgotPasswordFormSchema,
  ResetPasswordFormSchema,
};

export type {
  AuthFormInput,
  RegisterFormInput,
  LoginFormInput,
  ForgotPasswordFormInput,
  ResetPasswordFormInput,
};
