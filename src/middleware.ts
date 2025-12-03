import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // kullanıcının kimlik doğrulama oturumunu güncelle
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Şunlarla başlayanlar hariç tüm istek yollarıyla eşleş:
     * - _next/static (statik dosyalar)
     * - _next/image (görüntü optimizasyon dosyaları)
     * - favicon.ico (favicon dosyası)
     * Daha fazla yol eklemek için bu kalıbı değiştirmekten çekinmeyin.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
