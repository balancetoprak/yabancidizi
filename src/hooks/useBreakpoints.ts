import { useMediaQuery } from "@mantine/hooks";

/**
 * Tailwind'in kullandığı farklı kesme noktalarını temsil eden özelliklere sahip bir nesne sağlar.
 * Özellikler, kesme noktalarının adını alır ve
 * değerleri, kesme noktasının geçerli ekran boyutuyla eşleşip eşleşmediğini gösteren Boole değerleridir.
 * Ayrıca, nesne üç özellik daha içerir: mobil, tablet ve masaüstü. Bunlar, geçerli ekran boyutunu belirlemek için
 * kullanışlı kısayollardır.
 *
 * @returns {Object} Her kesme noktası için özelliklere sahip bir nesne ve
 * mobil, tablet ve masaüstü özellikleri.
 */
export default function useBreakpoints() {
  const sm = useMediaQuery("(min-width: 640px)");
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const xl = useMediaQuery("(min-width: 1280px)");
  const xxl = useMediaQuery("(min-width: 1536px)");

  const mobile = !md;
  const tablet = md && !lg;
  const desktop = lg;

  return { sm, md, lg, xl, xxl, mobile, tablet, desktop };
}
