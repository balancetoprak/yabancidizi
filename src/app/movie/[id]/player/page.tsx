"use client";

import { tmdb } from "@/api/tmdb";
import { getMovieLastPosition } from "@/actions/histories";
import MoviePlayer from "@/components/sections/Movie/Player/Player";
import { Params } from "@/types";
import { cn, isEmpty } from "@/utils/helpers";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import dynamic from "next/dynamic";
import { SpacingClasses } from "@/utils/constants";
const BackdropSection = dynamic(() => import("@/components/sections/Movie/Detail/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Movie/Detail/Overview"));

const MoviePlayerPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const {
    data: movieData,
    isPending: pending,
    error: err,
  } = useQuery({
    queryFn: () =>
      tmdb.movies.details(
        id,
        [
          "images",
          "videos",
          "credits",
          "keywords",
          "recommendations",
          "similar",
          "reviews",
          "watch/providers",
        ],
        "tr-TR",
      ),
    queryKey: ["movie-detail", id, "tr"],
  });

  const {
    data: movie,
    isPending,
    error,
  } = useQuery({
    queryFn: () => tmdb.movies.details(id, ["images"], "tr-TR"),
    queryKey: ["movie-player-detail", id, "tr"],
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getMovieLastPosition(id),
    queryKey: ["movie-player-start-at", id],
  });

  if (isPending || isPendingStartAt || pending || !movieData) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  if (error || isEmpty(movie)) return notFound();

  return (
    <div className={cn("mx-auto max-w-5xl", SpacingClasses.main)}>
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        <div className="flex flex-col gap-10">
          <BackdropSection movie={movieData} isPlayer />
          <OverviewSection movie={movieData} isPlayer />
          <MoviePlayer movie={movie} startAt={startAt} />
        </div>
      </Suspense>
    </div>
  );
};

export default MoviePlayerPage;
