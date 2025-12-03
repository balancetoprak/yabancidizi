import { createClient } from "@/utils/supabase/client";

const supabase = await createClient();

export async function getSavedShowIds(category: string) {
  const { data, error } = await supabase.from("shows").select("tmdb_ids").eq("category", category);

  if (error) {
    console.error("Supabase Error:", error);
    return [];
  }

  return data.map((m) => m.tmdb_ids);
}

export async function getSavedMovieIds(category: string) {
  const { data, error } = await supabase.from("movies").select("tmdb_ids").eq("category", category);

  if (error) {
    console.error("Supabase Error:", error);
    return [];
  }

  return data.map((m) => m.tmdb_ids);
}
