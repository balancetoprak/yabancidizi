"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Types
type ContentType = "movie" | "tv";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType;
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry extends WatchlistItem {
  user_id: string;
  created_at: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface WatchlistResponse extends ActionResponse<WatchlistEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

interface CheckWatchlistResponse extends ActionResponse {
  isInWatchlist: boolean;
}

/**
 * Öğeyi izleme listesine ekle
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "İzleme listenize öğe eklemek için giriş yapmış olmanız gerekir",
      };
    }

    if (!item.id || !item.type || !item.title) {
      return {
        success: false,
        error: "Gerekli alanlar eksik",
      };
    }

    if (!["movie", "tv"].includes(item.type)) {
      return {
        success: false,
        error: 'Geçersiz içerik türü. "Film" veya "TV" olmalı.',
      };
    }

    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        id: item.id,
        type: item.type,
        adult: item.adult || false,
        backdrop_path: item.backdrop_path || "",
        poster_path: item.poster_path || null,
        release_date: item.release_date || new Date().toISOString().split("T")[0],
        title: item.title,
        vote_average: item.vote_average || 0,
      })
      .select()
      .single<WatchlistEntry>();

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "Bu öğe zaten favori listenizde",
        };
      }

      console.error("Watchlist add error:", error);
      return {
        success: false,
        error: "Öğe favorilerim listesine eklenemedi",
      };
    }

    // Eğer varsa izleme listesi sayfanızı yeniden doğrulayın
    revalidatePath("/library");

    return {
      success: true,
      data,
      message: "Favorilerim listesine başarıyla eklendi",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    };
  }
}

export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "İzleme listenizden öğeleri kaldırmak için oturum açmış olmanız gerekir",
      };
    }

    if (!id || !type) {
      return {
        success: false,
        error: "Gerekli parametreler eksik",
      };
    }

    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: "Geçersiz içerik türü",
      };
    }

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type);

    if (error) {
      console.error("Watchlist remove error:", error);
      return {
        success: false,
        error: "Öğeyi izleme listesinden kaldıramadık",
      };
    }

    revalidatePath("/library");

    return {
      success: true,
      message: "İzleme listesinden başarıyla kaldırıldı",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    };
  }
}

export const removeAllWatchlist = async (type: ContentType): Promise<ActionResponse> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "İzleme listenizden öğeleri kaldırmak için oturum açmış olmanız gerekir",
      };
    }

    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: "Geçersiz içerik türü",
      };
    }

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("type", type);

    if (error) {
      console.error("Watchlist remove error:", error);
      return {
        success: false,
        error: "İzleme listesinden öğeler kaldırılamadı",
      };
    }

    revalidatePath("/library");

    return {
      success: true,
      message: "İzleme listesinden öğeler başarıyla kaldırıldı",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    };
  }
};

export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        isInWatchlist: false,
        error: "Kullanıcı kimliği doğrulanmadı",
      };
    }

    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = satır döndürülmedi
      console.error("Watchlist check error:", error);
      return {
        success: false,
        isInWatchlist: false,
        error: "İzleme listesi durumu kontrol edilemedi",
      };
    }

    return {
      success: true,
      isInWatchlist: !!data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      isInWatchlist: false,
      error: "Beklenmeyen bir hata oluştu",
    };
  }
}

/**
 * Kullanıcının izleme listesini sayfalandırma ile alın - sonsuz kaydırma için optimize edildi
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
): Promise<WatchlistResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        data: [],
        error: "Kullanıcının kimliği doğrulanmadı",
      };
    }

    const offset = (page - 1) * limit;

    let query = supabase
      .from("watchlist")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filterType !== "all" && ["movie", "tv"].includes(filterType)) {
      query = query.eq("type", filterType);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Watchlist fetch error:", error);
      return {
        success: false,
        data: [],
        error: "İzleme listesi alınamadı",
      };
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data: (data as WatchlistEntry[]) || [],
      totalCount: count || 0,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      data: [],
      error: "Beklenmeyen bir hata oluştu",
    };
  }
}

/**
 * İzleme listesi durumunu değiştir (yardımcı işlev)
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  const checkResult = await checkInWatchlist(item.id, item.type);

  if (!checkResult.success) {
    return checkResult;
  }

  if (checkResult.isInWatchlist) {
    return await removeFromWatchlist(item.id, item.type);
  } else {
    return await addToWatchlist(item);
  }
}
