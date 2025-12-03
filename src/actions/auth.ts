"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  ForgotPasswordFormInput,
  ForgotPasswordFormSchema,
  LoginFormInput,
  LoginFormSchema,
  RegisterFormInput,
  RegisterFormSchema,
  ResetPasswordFormInput,
  ResetPasswordFormSchema,
} from "@/schemas/auth";
import { z } from "zod";
import { ActionResponse } from "@/types";

/**
 * Kimlik doğrulama eylemlerimiz için genel bir tür.
 * @template T Form verilerinin türü.
 * @param data Doğrulanmış form verileri.
 * @param supabase Supabase istemci örneği.
 * @returns Bir ActionResponse.
 */
type AuthAction<T> = (data: T, supabase: SupabaseClient) => ActionResponse;

/**
 * Form doğrulama, captcha kontrolleri ve Supabase istemci oluşturma işlemlerini gerçekleştiren bir sunucu eylemi oluşturmak için daha üst düzey bir işlev.
 * @template T İsteğe bağlı bir captchaToken içermesi gereken form verilerinin türü.
 * @param schema Doğrulama için Zod şeması.
 * @param action Sunucu eyleminin temel mantığı.
 * @returns Sunucu eylemi olarak görev yapan eşzamansız bir işlev.
 */
const createAuthAction = <T extends { captchaToken?: string }>(
  schema: z.ZodSchema<T>,
  action: AuthAction<T>,
  admin?: boolean,
) => {
  return async (formData: T): ActionResponse => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(". ");
      return { success: false, message };
    }

    if (!result.data.captchaToken) {
      return { success: false, message: "Captcha doğrulanamadı." };
    }

    try {
      const supabase = await createClient(admin);
      return await action(result.data, supabase);
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: "Hata:" };
    }
  };
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data, supabase) => {
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.loginPassword,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (error) return { success: false, message: error.message };

  const { data: username, error: usernameError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.user.id)
    .maybeSingle();

  if (!username) {
    console.error("Username check error:", usernameError);
    return {
      success: false,
      message: `Veritabanı hatası. ${user.user.email} kullanıcı adı alınamadı.`,
    };
  }

  return { success: true, message: `Hoş geldin, ${username.username}` };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data, supabase) => {
  const { data: usernameExists, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .maybeSingle();

  if (usernameError) {
    console.error("Username check error:", usernameError);
    return {
      success: false,
      message: "Veritabanı hatası. Kullanıcı adı kullanılabilirliği kontrol edilemedi.",
    };
  }

  if (usernameExists) {
    return { success: false, message: "Kullanıcı adı zaten alınmış." };
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (signUpError) return { success: false, message: signUpError.message };
  if (!authData.user)
    return { success: false, message: "Kullanıcı oluşturulamadı. Lütfen tekrar deneyin." };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, username: data.username });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    return {
      success: false,
      message: "Kullanıcı profili oluşturulamadı. Lütfen destek ekibiyle iletişime geçin.",
    };
  }

  return {
    success: true,
    message: "Kayıt başarılı.",
  };
};

const sendResetPasswordEmailAction: AuthAction<ForgotPasswordFormInput> = async (
  data,
  supabase,
) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    captchaToken: data.captchaToken,
  });

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: `${data.email} adresine bir e-posta gönderdik. Göremiyorsanız spam klasörünü kontrol edin.`,
  };
};

const resetPasswordAction: AuthAction<ResetPasswordFormInput> = async (data, supabase) => {
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Şifre başarıyla sıfırlandı." };
};

export const signIn = createAuthAction(LoginFormSchema, signInWithEmailAction);
export const signUp = createAuthAction(RegisterFormSchema, signUpAction, true);
export const sendResetPasswordEmail = createAuthAction(
  ForgotPasswordFormSchema,
  sendResetPasswordEmailAction,
);
export const resetPassword = createAuthAction(ResetPasswordFormSchema, resetPasswordAction);

export const signOut = async (): ActionResponse => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Çıkış yapıldı." };
};
