import { Mail } from "@/utils/icons";
import { addToast, Button, Input } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { ForgotPasswordFormSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isEmpty } from "@/utils/helpers";
import { useCallback, useState } from "react";
import { sendResetPasswordEmail } from "@/actions/auth";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "@/utils/env";

const AuthForgotPasswordForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await sendResetPasswordEmail(data);

    if (!success) {
      setValue("captchaToken", undefined);
      setIsVerifying(false);
    }

    return addToast({
      title: message,
      color: success ? "success" : "danger",
      timeout: success ? Infinity : undefined,
    });
  });

  const onCaptchaSuccess = useCallback(
    (token: string) => {
      setValue("captchaToken", token);
      setIsVerifying(false);
      onSubmit();
    },
    [setValue, setIsVerifying, onSubmit],
  );

  const getButtonText = useCallback(() => {
    if (isSubmitting) return "Email gönderiliyor...";
    if (isVerifying) return "Doğrulanıyor...";
    return "Gönder";
  }, [isSubmitting, isVerifying]);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        Şifrenizimi unuttunuz? Bu bir sorun değil hemen kayıtlı olan e-posta adresinizi yazın bir şifre sıfırlama bağlantısı gönderelim!
      </p>
      <div className="group relative">
        <Mail className="text-gray-100 group-hover:text-white/80 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transition" />
        <input
        {...register("email")}
        type="email"
        placeholder="Email"
        className="focus:border-primary focus:ring-primary/40 w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-xl transition outline-none focus:ring-2"
        disabled={isSubmitting || isVerifying}
        required
        />
        {errors.email?.message && (
          <p className="ml-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>
      {isVerifying && (
        <Turnstile
          className="flex h-fit w-full items-center justify-center"
          siteKey={env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
          onSuccess={onCaptchaSuccess}
        />
      )}
      <Button
        className="mt-3 w-full"
        color="primary"
        type="submit"
        variant="shadow"
        isLoading={isSubmitting || isVerifying}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};

export default AuthForgotPasswordForm;
