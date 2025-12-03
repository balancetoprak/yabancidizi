import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";
import { Database } from "./types";

export async function createClient(admin?: boolean) {
  const cookieStore = await cookies();

  const key = admin ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Yeni yapılandırılmış çerezle bir sunucunun süperbase istemcisini oluşturun,
  // Bu, kullanıcının oturumunu sürdürmek için kullanılabilir
  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch (error) {
          // `setAll` metodu bir Sunucu Bileşeninden çağrıldı.
          // Kullanıcı oturumlarını yenileyen bir ara yazılımınız varsa bu durum göz ardı edilebilir.
          console.error("Failed to set cookies:", error);
        }
      },
    },
  });
}
