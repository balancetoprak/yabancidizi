import {
  intervalToDuration,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { Movie, MovieDetails, TV, TvShowDetails } from "tmdb-ts";

/**
 * Bir filmin süresini dakikadan okunabilir bir biçime dönüştürür.
 *
 * @param minutes - Filmin süresi dakika cinsinden. Belirtilmezse varsayılan değer 0'dır.
 * @returns Filmin süresini "Xh Ym" biçiminde temsil eden bir dize döndürür; burada X saat, Y ise dakika sayısıdır.
 *
 * @example
 */
export const movieDurationString = (minutes?: number): string => {
  if (!minutes) return "N/A";
  const duration = intervalToDuration({ start: 0, end: minutes * 60 * 1000 });
  const hours = duration.hours ? `${duration.hours}h ` : "";
  const mins = duration.minutes ? `${duration.minutes}m` : "";
  return `${hours}${mins}`;
};

/**
 * Süreyi saniye cinsinden, okunabilir bir biçime dönüştürür.
 *
 * @param seconds - Süreyi saniye cinsinden belirtir.
 * @returns "X:Y:Z" veya "Y:Z" biçiminde süreyi temsil eden bir dize döndürür; burada X saat, Y dakika ve Z saniyedir.
 */
export const formatDuration = (seconds: number): string => {
  const s = Math.round(seconds);

  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
};

/**
 * Belirtilen tarihten bu yana geçen süreyi temsil eden bir dize döndürür.
 *
 * @param date - Geçerli tarihle karşılaştırılacak tarih.
 * @returns Belirtilen tarihten bu yana geçen süreyi temsil eden bir dize döndürür.
 */
export const timeAgo = (date: Date | string): string => {
  const now = new Date();

  const seconds = differenceInSeconds(now, date);
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);
  const years = differenceInYears(now, date);

  if (seconds < 20) return "Şimdi";
  if (seconds < 60) return `${seconds} saniye önce`;

  if (minutes === 1) return "1 dakika önce";
  if (minutes < 60) return `${minutes} dakika önce`;

  if (hours === 1) return "1 saat önce";
  if (hours < 24) return `${hours} saat önce`;

  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;

  if (weeks === 1) return "1 hafta önce";
  if (weeks < 5) return `${weeks} hafta önce`;

  if (months === 1) return "Geçen ay";
  if (months < 12) return `${months} ay önce`;

  if (years === 1) return "Geçen yıl";
  return `${years} yıl önce`;
};

/**
 * TMDB API'sinden alınan bir görsel için, belirtilen yol ve türe göre bir URL oluşturur.
 * Yol belirtilmezse, görsel türüne göre bir yedek URL döndürülür.
 *
 * @param path - Görsel kaynağına giden yol. İsteğe bağlı.
 * @param type - Görselin türü; "poster", "backdrop", "title" veya "avatar" olabilir. Varsayılan olarak "poster"dır.
 * @param fullSize - Tam boyutlu görselin alınıp alınmayacağını belirten bir Boole değeri. Varsayılan olarak false'tur.
 * @returns Görselin tam URL'sini temsil eden bir dize.
 *
 * @example
 * getImageUrl('somepath.jpg', 'backdrop', true)
 * // 'http://image.tmdb.org/t/p/original/somepath.jpg' değerini döndürür
 *
 * @example
 * getImageUrl(undefined, 'poster')
 * // 'https://dancyflix.com/placeholder.png' değerini döndürür
 */
export const getImageUrl = (
  path?: string,
  type: "poster" | "backdrop" | "title" | "avatar" = "poster",
  fullSize?: boolean,
): string => {
  const size = fullSize ? "original" : "w500";
  const fallback =
    type === "poster"
      ? "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image"
      : type === "backdrop"
        ? "https://wallpapercave.com/wp/wp1945939.jpg"
        : "";
  return path ? `http://image.tmdb.org/t/p/${size}/${path}` : fallback;
};

/**
 * Belirtilen dilde bir filmin adını döndürür. Film belirtilen dildeyse, orijinal başlık kullanılır.
 * Aksi takdirde, başlık kullanılır. Film belirtilmemişse, boş bir dize döndürülür.
 *
 * @param movie: Başlığı alınacak film. İsteğe bağlı.
 * @param language: Başlığı alınacak dil. Varsayılan olarak "id"dir.
 * @returns: Filmin belirtilen dilde adı veya film belirtilmemişse boş bir dize döndürülür.
 */
export const mutateMovieTitle = (movie?: MovieDetails | Movie, language: string = "id"): string => {
  if (!movie) return "N/A";
  return movie.original_language === language ? movie.original_title : movie.title;
};

/**
 * Belirtilen dilde bir TV programının adını döndürür. TV programı belirtilen dildeyse, orijinal adı kullanılır.
 * Aksi takdirde, adı kullanılır. TV programı belirtilmemişse, boş bir dize döndürülür.
 *
 * @param tv Başlığı alınacak TV programı. İsteğe bağlı.
 * @param language Başlığın alınacağı dil. Varsayılan olarak "id"dir.
 * @returns Belirtilen dilde TV programının adını veya TV programı belirtilmemişse boş bir dize döndürülür.
 */
export const mutateTvShowTitle = (tv?: TvShowDetails | TV, language: string = "id"): string => {
  if (!tv) return "N/A";
  return tv.original_language === language ? tv.original_name : tv.name;
};

/**
 * Eğlenceli bir yükleme animasyonu için rastgele bir etiket döndürür.
 *
 * @returns Eğlenceli bir yükleme animasyonu için rastgele bir etiket döndürür.
 */
export const getLoadingLabel = (): string => {
  const labels = [
    "...",
  ];

  const randomIndex = Math.floor(Math.random() * labels.length);
  return labels[randomIndex];
};
