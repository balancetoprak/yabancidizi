import { resetPassword } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { ResetPasswordFormSchema } from "@/schemas/auth";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { LockPassword } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import { addToast, Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const AuthResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await resetPassword(data);

    addToast({
      title: message,
      color: success ? "success" : "danger",
    });

    if (!success) {
      setValue("captchaToken", undefined);
      setIsVerifying(false);
      return;
    }

    return router.push("/");
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
    if (isSubmitting) return "Şifre Sıfırlanıyor...";
    if (isVerifying) return "Doğrulanıyor...";
    return "Şifre Sıfırla";
  }, [isSubmitting, isVerifying]);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        Hesabınızı kurtarmak için yeni şifrenizi girin
      </p>
      <div className="group relative">
      <LockPassword className="text-gray-100 group-hover:text-white/80 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transition" />
      <input
      {...register("password")}
      value={watch("password")}
      type="password"
      placeholder="Yeni Şifre"
      className="focus:border-primary focus:ring-primary/40 w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-xl transition outline-none focus:ring-2"
      disabled={isSubmitting || isVerifying}
      required
      />
      {errors.password?.message && (
        <p className="ml-1 text-sm text-red-400">{errors.password.message}</p>
      )}
      </div>

      <div className="group relative">
      <LockPassword className="text-gray-100 group-hover:text-white/80 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transition" />
      <input
      {...register("confirm")}
      type="password"
      placeholder="Yeni Şifreyi Doğrulayın"
      className="focus:border-primary focus:ring-primary/40 w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-xl transition outline-none focus:ring-2"
      disabled={isSubmitting || isVerifying}
      required
      />
      {errors.confirm?.message && (
        <p className="ml-1 text-sm text-red-400">{errors.confirm.message}</p>
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

export default AuthResetPasswordForm;
