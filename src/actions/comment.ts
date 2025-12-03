"use server";

import { createClient } from "@/utils/supabase/server";

interface CommentItem {
  author: string;
  movie_id: number;
  content: string;
  pinned?: boolean;
}

export interface CommentProfile {
  id: string;
  username: string;
  avatar: string;
}

export interface CommentEntry {
  id: string;
  movie_id: number;
  author: string;
  content: string;
  pinned: boolean;
  created_at: string;
  profiles: CommentProfile | null;
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface CommentResponse extends ActionResponse<CommentEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

/**
 * Yorum ekleme
 */
export async function addComment(item: CommentItem): Promise<ActionResponse<CommentEntry>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Yorum yapmak için giriş yapmış olmanız gerekiyor!",
      };
    }

    if (!item.content || !item.movie_id) {
      return {
        success: false,
        error: "Tüm alanlar doldurulmalıdır!",
      };
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        movie_id: item.movie_id,
        author: user.id,
        content: item.content,
      })
      .select(
        `
        *,
        profiles (
          id,
          username
        )
      `,
      )
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as CommentEntry,
      message: "Yorum başarıyla eklendi!",
    };
  } catch {
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    };
  }
}

/**
 * Yorumları getir
 */
export async function getComments(
  movie_id: number,
  page: number = 1,
  limit: number = 20,
): Promise<CommentResponse> {
  try {
    const supabase = await createClient();

    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("comments")
      .select(
        `
    *,
    profiles:author (username,avatar)
  `,
        { count: "exact" },
      )
      .eq("movie_id", movie_id)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log("Comment fetch error:", error);
      return {
        success: false,
        data: [],
        error: "Yorumlar alınamadı",
      };
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data: (data as CommentEntry[]) || [],
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
