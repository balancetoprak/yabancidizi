import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `clsx` ve `tailwind-merge` kullanarak Tailwind CSS sınıflarını birleştiren bir yardımcı fonksiyon.
 * Bu fonksiyon, herhangi bir sayıda `ClassValue` girdisini kabul eder ve tek bir birleştirilmiş sınıf dizesi döndürür.
 *
 * @param inputs - Tailwind CSS sınıflarını temsil eden herhangi bir sayıda `ClassValue` girdisi.
 * @returns JSX öğelerinde kullanılabilen tek bir birleştirilmiş sınıf dizesi.
 *
 * @example cn('font-bold', 'text-center')
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Bir değişkenin boş olup olmadığını kontrol eder
 * - `null` ve `undefined` boş kabul edilir
 * - Boş dizeler, diziler, eşlemeler, kümeler ve nesneler boş kabul edilir
 * - 0 sayısı boş kabul edilmez
 * - Boolean false boş kabul edilmez
 *
 * @param value - Kontrol edilecek değer
 * @returns Değer boş kabul edilirse True, aksi takdirde false
 */
export const isEmpty = <T>(value: T): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
};

/**
 * Bir sayıyı, büyük sayılar için kısaltmalar içeren, okunabilir bir dizeye biçimlendirir.
 * Örneğin, 1000, 1k, 1000000 ise 1m olur, vb.
 *
 * @param num - Biçimlendirilecek sayı
 * @param options - Biçimlendirme için isteğe bağlı yapılandırma
 * @returns Biçimlendirilen sayıyı dize olarak döndürür
 */
export function formatNumber(
  num: number,
  options: {
    decimals?: number;
    forceDecimals?: boolean;
    uppercase?: boolean;
  } = {},
): string {
  const { decimals = 1, forceDecimals = false, uppercase = false } = options;

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const abbreviations: { threshold: number; suffix: string }[] = [
    { threshold: 1e12, suffix: "t" },
    { threshold: 1e9, suffix: "b" },
    { threshold: 1e6, suffix: "m" },
    { threshold: 1e3, suffix: "k" },
  ];

  for (const { threshold, suffix } of abbreviations) {
    if (absNum >= threshold) {
      const abbreviated = absNum / threshold;

      let result: string;
      if (forceDecimals || abbreviated % 1 !== 0) {
        result = abbreviated.toFixed(decimals);
        if (!forceDecimals) {
          result = result.replace(/\.?0+$/, "");
        }
      } else {
        result = abbreviated.toFixed(0);
      }

      const formattedSuffix = uppercase ? suffix.toUpperCase() : suffix;
      return (isNegative ? "-" : "") + result + formattedSuffix;
    }
  }

  return num.toString();
}

/**
 * Bir tarih dizesini veya Tarih nesnesini okunabilir bir dizeye biçimlendirir.
 *
 * @param date - Biçimlendirilecek tarih
 * @param locale - Biçimlendirme için kullanılacak yerel ayar
 * @param options - Biçimlendirme seçenekleri
 * @returns Biçimlendirilmiş tarihi dize olarak döndürür
 */
export const formatDate = (
  date: string | Date,
  locale: string = "id-ID",
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date input");
  }

  return new Intl.DateTimeFormat(locale, options).format(parsedDate);
};

/**
 * Bir dizinin elemanlarını yerinde karıştırır.
 *
 * @param array - Karıştırılacak dizi
 * @returns Karıştırılan dizi
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};

/**
 * İki sayı arasındaki mutlak farkı hesaplar.
 *
 * @param a - İlk sayı
 * @param b - İkinci sayı
 * @returns İki sayı arasındaki mutlak farkı
 */
export const diff = (a: number, b: number): number => {
  return Math.abs(Math.round(a) - Math.round(b));
};
