"use server";

import { tmdb } from "@/api/tmdb";
import { VidlinkEventData } from "@/hooks/useVidlinkPlayer";
import { ActionResponse } from "@/types";
import { HistoryDetail } from "@/types/movie";
import { mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { createClient } from "@/utils/supabase/server";

export const syncHistory = async (
  data: VidlinkEventData["data"],
  completed?: boolean,
): ActionResponse => {
  console.info("Saving history:", data);

  if (!data) return { success: false, message: "Kaydedilecek veri yok" };

  if (data.mediaType === "tv" && (!data.season || !data.episode)) {
    return { success: false, message: "Eksik sezon veya bölüm" };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Geçmiş, kaydetmek için giriş yapmış olmanız gerekir",
      };
    }

    if (!data.mtmdbId || !data.mediaType) {
      return {
        success: false,
        message: "Gerekli alanlar eksik",
      };
    }

    if (!["movie", "tv"].includes(data.mediaType)) {
      return {
        success: false,
        message: 'Geçersiz içerik türü. "Film" veya "TV" olmalıdır.',
      };
    }

    const media =
      data.mediaType === "movie"
        ? await tmdb.movies.details(data.mtmdbId)
        : await tmdb.tvShows.details(data.mtmdbId);

    const { data: history, error } = await supabase
      .from("histories")
      .upsert(
        {
          user_id: user.id,
          media_id: data.mtmdbId,
          type: data.mediaType,
          season: data.season || 0,
          episode: data.episode || 0,
          duration: data.duration,
          last_position: data.currentTime,
          completed: completed || false,
          adult: "adult" in media ? media.adult : false,
          backdrop_path: media.backdrop_path,
          poster_path: media.poster_path,
          release_date: "release_date" in media ? media.release_date : media.first_air_date,
          title: "title" in media ? mutateMovieTitle(media) : mutateTvShowTitle(media),
          vote_average: media.vote_average,
        },
        {
          onConflict: "user_id,media_id,type,season,episode",
        },
      )
      .select();

    if (error) {
      console.info("History save error:", error);
      return {
        success: false,
        message: "Geçmiş kaydedilemedi",
      };
    }

    console.info("History saved:", history);

    return {
      success: true,
      message: "Geçmiş kaydedildi",
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
    };
  }
};

export const getUserHistories = async (limit: number = 20): ActionResponse<HistoryDetail[]> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Kullanıcının kimliği doğrulanmadı",
      };
    }

    const { data, error } = await supabase
      .from("histories")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.info("History fetch error:", error);
      return {
        success: false,
        message: "Geçmiş alınamadı",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
    };
  }
};

export const getMovieLastPosition = async (id: number): Promise<number> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "movie");

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};

export const getTVLastEpisode = async (id: number): Promise<number> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
    .from("histories")
    .select("season, episode, last_position")
    .eq("user_id", user.id)
    .eq("media_id", id)
    .eq("type", "tv");

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0] || {season: 0, episode: 0, last_position: 0};
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};

export const getTvShowLastPosition = async (
  id: number,
  season: number,
  episode: number,
): Promise<number> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "tv")
      .eq("season", season)
      .eq("episode", episode);

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};
