"use client";

import { Image, Chip, Button } from "@heroui/react";
import { getImageUrl, mutateTvShowTitle } from "@/utils/movies";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import ShareButton from "@/components/ui/button/ShareButton";
import { AppendToResponse } from "tmdb-ts/dist/types/options";
import { useDocumentTitle } from "@mantine/hooks";
import { siteConfig } from "@/config/site";
import { FaCirclePlay, FaPlay } from "react-icons/fa6";
import Genres from "@/components/ui/other/Genres";
import { TvShowDetails } from "tmdb-ts";
import { Calendar, List, Season } from "@/utils/icons";
import Rating from "@/components/ui/other/Rating";
import Trailer from "@/components/ui/overlay/Trailer";
import { SavedMovieDetails } from "@/types/movie";
import { motion } from "framer-motion";
import { cn } from "@/utils/helpers";
import { getTVLastEpisode } from "@/actions/histories";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface TvShowOverviewSectionProps {
  tv: AppendToResponse<TvShowDetails, "videos"[], "tvShow">;
  onViewEpisodesClick: () => void;
  season?: string;
  episode?: string;
  isPlayer?: boolean;
}

export const TvShowOverviewSection: React.FC<TvShowOverviewSectionProps> = ({
  tv,
  onViewEpisodesClick,
  isPlayer,
}) => {
  const router = useRouter();
  const firstReleaseYear = new Date(tv.first_air_date).getFullYear();
  const lastReleaseYear = new Date(tv.last_air_date).getFullYear();
  const releaseYears = `${firstReleaseYear} ${
    firstReleaseYear !== lastReleaseYear ? ` - ${lastReleaseYear}` : ""
  }`;
  const posterImage = getImageUrl(tv.poster_path);
  const title = mutateTvShowTitle(tv);
  const fullTitle = title;
  const bookmarkData: SavedMovieDetails = {
    type: "tv",
    adult: "adult" in tv ? (tv.adult as boolean) : false,
    backdrop_path: tv.backdrop_path,
    id: tv.id,
    poster_path: tv.poster_path,
    release_date: tv.first_air_date,
    title: fullTitle,
    vote_average: tv.vote_average,
    saved_date: new Date().toISOString(),
  };

  const { data: lastData } = useQuery({
    queryFn: () => getTVLastEpisode(tv.id),
                                      queryKey: ["tv-last-data", tv.id],
  });

  useDocumentTitle(`${fullTitle} | ${siteConfig.name}`);

  const handleWatchClick = () => {
    if (lastData?.season && lastData?.episode) {
      router.push(`/tv/${tv.id}/${lastData.season}/${lastData.episode}/player`);
    } else {
      router.push(`/tv/${tv.id}/1/1/player`);
    }
  };

  const getWatchButtonText = () => {
    if (lastData?.season && lastData?.episode) {
      return `S${lastData.season} E${lastData.episode} İzle`;
    }
    return "İzle";
  };

  return (
    <section
    className={cn("relative flex flex-col gap-12", {
      "pt-[25vh] mb-24": !isPlayer,
    })}
    id="overview"
    >
    <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className="flex flex-col items-start gap-12 lg:flex-row"
    >
    {!isPlayer && (
      <div className="group relative w-52 overflow-hidden rounded-2xl shadow-2xl backdrop-blur lg:w-64">
      <Image
      src={posterImage}
      alt={fullTitle}
      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 transition-all group-hover:opacity-60" />
      </div>
    )}

    <div className="flex w-full flex-col gap-8">
    <h1 className="to-primary bg-gradient-to-r from-white bg-clip-text text-3xl leading-tight font-extrabold text-transparent drop-shadow-xl lg:text-5xl">
    {fullTitle}
    </h1>

    {!isPlayer && (
      <>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
      <div className="flex items-center gap-1">
      <Season /> {tv.number_of_seasons} Sezon
      </div>
      <span className="opacity-50">•</span>
      <div className="flex items-center gap-1">
      <List /> {tv.number_of_episodes} Bölüm
      </div>
      <span className="opacity-50">•</span>
      <div className="flex items-center gap-1">
      <Calendar /> {releaseYears}
      </div>
      <span className="opacity-50">•</span>
      <Rating rate={tv.vote_average} count={tv.vote_count} />
      </div>

      <Genres genres={tv.genres} type="tv" />

      <p className="max-w-3xl text-sm leading-relaxed text-gray-300 md:text-base">
      {tv.overview}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-4">
      <Button
      color="warning"
      variant="shadow"
      onPress={handleWatchClick}
      startContent={<FaPlay size={18} />}
      className="hover:shadow-warning/40 rounded-full px-6 py-3 font-semibold hover:scale-[1.03] active:scale-95"
      >
      {getWatchButtonText()}
      </Button>

      <Trailer videos={tv.videos.results} color="warning" />

      <BookmarkButton data={bookmarkData} />
      </div>

      {lastData?.season && lastData?.episode && (
        <div className="mt-2 text-sm text-gray-400">
        <span className="text-primary-300 font-medium">
        S{lastData.season} E{lastData.episode}
        </span>
        {" kaldığınız yerden devam edin"}
        </div>
      )}
      </>
    )}
    </div>
    </motion.div>
    </section>
  );
};

export default TvShowOverviewSection;
