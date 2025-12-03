"use client";

import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import dynamic from "next/dynamic";
import { NextPage } from "next";
import { getTvShowLastPosition } from "@/actions/histories";
import { cn } from "@/utils/helpers";
import { SpacingClasses } from "@/utils/constants";
import TvShowBackdropSection from "@/components/sections/TV/Details/Backdrop";
import TvShowOverviewSection from "@/components/sections/TV/Details/Overview";
import { useScrollIntoView } from "@mantine/hooks";
const TvShowPlayer = dynamic(() => import("@/components/sections/TV/Player/Player"));
const TvShowsSeasonsSelection = dynamic(() => import("@/components/sections/TV/Details/Seasons"));

const TvShowPlayerPage: NextPage<Params<{ id: number; season: number; episode: number }>> = ({
  params,
}) => {
  const { id, season, episode } = use(params);

  const {
    data: tv,
    isPending: isPendingTv,
    error: errorTv,
  } = useQuery({
    queryFn: () => tmdb.tvShows.details(id),
    queryKey: ["tv-show-player-details", id],
  });

  const {
    data: seasonDetail,
    isPending: isPendingSeason,
    error: errorSeason,
  } = useQuery({
    queryFn: () => tmdb.tvShows.season(id, season),
    queryKey: ["tv-show-season", id, season],
  });

  const {
    data: tvData,
    isPending,
    error,
  } = useQuery({
    queryKey: ["tv-detail", id],
    queryFn: () =>
      tmdb.tvShows.details(
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
          "translations",
        ],
        "tr-TR",
      ),
    staleTime: 1000 * 60 * 10,
  });

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    duration: 500,
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getTvShowLastPosition(id, season, episode),
    queryKey: ["tv-show-player-start-at", id, season, episode],
  });

  if (isPendingTv || isPendingSeason || isPendingStartAt || isPending) {
    return <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />;
  }

  const EPISODE = seasonDetail?.episodes.find(
    (e) => e.episode_number.toString() === episode.toString(),
  );

  if (!EPISODE || errorTv || errorSeason || error) notFound();

  const isNotReleased = new Date(EPISODE.air_date) > new Date();

  if (isNotReleased) notFound();

  const currentEpisodeIndex = seasonDetail.episodes.findIndex(
    (e) => e.episode_number === EPISODE.episode_number,
  );

  const nextEpisodeNumber =
    currentEpisodeIndex < seasonDetail.episodes.length - 1
      ? new Date(seasonDetail.episodes[currentEpisodeIndex + 1].air_date) > new Date()
        ? null
        : seasonDetail.episodes[currentEpisodeIndex + 1].episode_number
      : null;

  const prevEpisodeNumber =
    currentEpisodeIndex > 0 ? seasonDetail.episodes[currentEpisodeIndex - 1].episode_number : null;

  return (
    <div className={cn("mx-auto max-w-5xl", SpacingClasses.main)}>
      <Suspense
        fallback={
          <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />
        }
      >
        <div className="flex flex-col gap-10">
          <TvShowBackdropSection tv={tvData} isPlayer />
          <TvShowOverviewSection
            onViewEpisodesClick={() => scrollIntoView({ alignment: "center" })}
            tv={tvData}
            isPlayer
          />
          <TvShowPlayer
            tv={tv}
            id={id}
            seriesName={tv.name}
            seasonName={seasonDetail.name}
            episode={EPISODE}
            episodes={seasonDetail.episodes}
            nextEpisodeNumber={nextEpisodeNumber}
            prevEpisodeNumber={prevEpisodeNumber}
            startAt={startAt}
          />
          <TvShowsSeasonsSelection ref={targetRef} id={id} seasons={tvData.seasons} isPlayer />
        </div>
      </Suspense>
    </div>
  );
};

export default TvShowPlayerPage;
