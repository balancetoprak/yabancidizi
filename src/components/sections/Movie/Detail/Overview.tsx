"use client";

import Link from "next/link";
import { FaPlayCircle } from "react-icons/fa";
import { Calendar, Clock } from "@/utils/icons";
import { motion } from "framer-motion";
import { useDocumentTitle } from "@mantine/hooks";
import { getImageUrl, movieDurationString, mutateMovieTitle } from "@/utils/movies";
import Genres from "@/components/ui/other/Genres";
import Rating from "@/components/ui/other/Rating";
import Trailer from "@/components/ui/overlay/Trailer";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import ShareButton from "@/components/ui/button/ShareButton";
import { SavedMovieDetails } from "@/types/movie";
import { MovieDetails } from "tmdb-ts";
import { Image } from "@heroui/react";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";

interface Props {
  movie: MovieDetails & {
    videos: { results: any[] };
  };
  isPlayer?: boolean;
}

const Overview: React.FC<Props> = ({ movie, isPlayer }) => {
  const title = mutateMovieTitle(movie);
  const poster = getImageUrl(movie.poster_path);
  const year = new Date(movie.release_date).getFullYear();
  const { mobile } = useBreakpoints();

  useDocumentTitle(`${title} • Yabancı Dizi`);

  const bookmarkData: SavedMovieDetails = {
    type: "movie",
    id: movie.id,
    title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    adult: movie.adult,
    saved_date: new Date().toISOString(),
  };

  return (
    <section
      className={cn("relative flex flex-col gap-12", {
        "mb-24 pt-[25vh]": !isPlayer,
      })}
    >
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-col items-start gap-12 lg:flex-row"
      >
        {!mobile && !isPlayer && (
          <div className="group relative w-52 overflow-hidden rounded-2xl shadow-2xl backdrop-blur lg:w-64">
            <Image
              src={poster}
              alt={title}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 transition-all group-hover:opacity-60" />
          </div>
        )}

        <div className="flex w-full flex-col gap-8">
          <h1 className="to-primary bg-gradient-to-r from-white bg-clip-text text-3xl leading-tight font-extrabold text-transparent drop-shadow-xl lg:text-5xl">
            {title}
          </h1>
          {!isPlayer && (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock /> {movieDurationString(movie.runtime)}
                </div>
                <span className="opacity-50">•</span>
                <div className="flex items-center gap-1">
                  <Calendar /> {year}
                </div>
                <span className="opacity-50">•</span>
                <Rating rate={movie.vote_average} />
                {movie.adult && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold shadow-lg">
                    18+
                  </span>
                )}
              </div>

              <Genres genres={movie.genres} />

              <p className="max-w-3xl text-sm leading-relaxed text-gray-300 md:text-base">
                {movie.overview}
              </p>
            </>
          )}
          <div className="mt-2 flex flex-wrap gap-4">
            {!isPlayer && (
              <>
                <Link
                  href={`/movie/${movie.id}/player`}
                  className="bg-primary hover:shadow-primary/50 hover:bg-primary/80 flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white shadow-xl transition-all hover:scale-[1.03] active:scale-95"
                >
                  <FaPlayCircle size={22} />
                  Şimdi İzle
                </Link>

                <Trailer videos={movie.videos.results} />

                <BookmarkButton data={bookmarkData} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Overview;
