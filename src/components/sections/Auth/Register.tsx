import { signUp } from "@/actions/auth";
import { Google, LockPassword, Mail, User } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { RegisterFormSchema } from "@/schemas/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback, useState } from "react";
import { isEmpty } from "@/utils/helpers";
import { env } from "@/utils/env";

interface AuthRegisterFormProps {
  setForm: (f: "login" | "register" | "forgot") => void;
}

const AuthRegisterForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
              mode: "onChange",
              defaultValues: {
                username: "",
                email: "",
                password: "",
                confirm: "",
              },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await signUp(data);

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
    if (isSubmitting) return "Kayıt Olunuyor...";
    if (isVerifying) return "Doğrulanıyor...";
    return "Kayıt Ol";
  }, [isSubmitting, isVerifying]);

  return (
    <div className="flex flex-col gap-5">
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
    <p className="text-small text-foreground-500 mb-4 text-center">
    Tüm özelliklerden faydalanmak için giriş yap!
    </p>
    <div className="group relative">
      <User className="text-gray-100 group-hover:text-white/80 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transition" />
      <input
      {...register("username")}
      placeholder="Kullanıcı adı"
      className="focus:border-primary focus:ring-primary/40 w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-xl transition outline-none focus:ring-2"
      disabled={isSubmitting || isVerifying}
      required
      />
      {errors.username?.message && (
        <p className="ml-1 text-sm text-red-400">{errors.username.message}</p>
      )}
    </div>

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

    <div className="group relative">
      <LockPassword className="text-gray-100 group-hover:text-white/80 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transition" />
      <input
      {...register("password")}
      value={watch("password")}
      type="password"
      placeholder="Şifre"
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
      placeholder="Şifreni Doğrula"
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
    <div className="flex items-center gap-4 py-2">
    <Divider className="flex-1" />
    <p className="text-tiny text-default-500 shrink-0">veya</p>
    <Divider className="flex-1" />
    </div>
    <p className="text-small text-center">
    Zaten hesabın var mı?{" "}
    <Link
    isBlock
    onClick={() => setForm("login")}
    size="sm"
    className="cursor-pointer"
    isDisabled={isSubmitting || isVerifying}
    >
    Giriş Yap
    </Link>
    </p>
    </div>
  );
};

export default AuthRegisterForm;
