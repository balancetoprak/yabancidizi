import { signIn } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { LoginFormSchema } from "@/schemas/auth";
import { isEmpty } from "@/utils/helpers";
import { Google, LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { env } from "@/utils/env";
import { useRouter } from "@bprogress/next/app";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      loginPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await signIn(data);

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
    if (isSubmitting) return "Giriş Yapılıyor...";
    if (isVerifying) return "Doğrulanıyor...";
    return "Giriş Yap";
  }, [isSubmitting, isVerifying]);

  return (
    <div className="flex w-full flex-col p-8">
      <form className="flex flex-col space-y-3" onSubmit={onSubmit}>
        <h2 className="mb-2 text-center text-3xl font-light text-white">Hoş Geldiniz</h2>
        <p className="mb-8 text-center text-gray-400">Devam etmek için giriş yapın.</p>
        <div className="flex flex-col gap-1">
          <div className="group relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-100 transition group-hover:text-white/80" />
            <input
              {...register("email")}
              value={watch("email")}
              type="email"
              placeholder="Email"
              className="focus:border-primary focus:ring-primary/40 w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-xl transition outline-none focus:ring-2"
              disabled={isSubmitting || isVerifying}
              required
            />
          </div>
          {errors.email?.message && (
            <p className="ml-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="group relative">
            <LockPassword className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-100 transition group-hover:text-white/80" />
            <input
              {...register("loginPassword")}
              value={watch("loginPassword")}
              type="password"
              placeholder="Şifre"
              className="focus:border-primary focus:ring-primary/40 w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-xl transition outline-none focus:ring-2"
              disabled={isSubmitting || isVerifying}
              required
            />
          </div>
          {errors.loginPassword?.message && (
            <p className="ml-1 text-sm text-red-400">{errors.loginPassword.message}</p>
          )}
        </div>
        <div className="flex w-full items-center justify-end px-1 py-2">
          <Link
            size="sm"
            className="text-foreground cursor-pointer"
            onClick={() => setForm("forgot")}
            isDisabled={isSubmitting || isVerifying}
          >
            Şifremi Unuttum?
          </Link>
        </div>
        {isVerifying && (
          <Turnstile
            className="flex h-fit w-full items-center justify-center"
            siteKey={env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
            onSuccess={onCaptchaSuccess}
          />
        )}
        <Button
          color="primary"
          type="submit"
          variant="shadow"
          isLoading={isSubmitting || isVerifying}
        >
          {getButtonText()}
        </Button>
      </form>
      <div className="mt-4 flex items-center gap-4">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">veya</p>
        <Divider className="flex-1" />
      </div>
      <p className="text-small mt-2 text-center">
        Hesabım Yok?
        <Link
          isBlock
          size="sm"
          className="cursor-pointer"
          onClick={() => setForm("register")}
          isDisabled={isSubmitting || isVerifying}
        >
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
};

export default AuthLoginForm;
