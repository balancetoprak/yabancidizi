"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import {useQuery} from "@tanstack/react-query";
import {tmdb} from "@/api/tmdb";
import {Chip, Skeleton} from "@heroui/react";
import Link from "next/link";
import Rating from "@/components/ui/other/Rating";
import Genres from "@/components/ui/other/Genres";
import{Genre} from "tmdb-ts";
import Autoplay from "embla-carousel-autoplay";

const ModernHero : React.FC = () => {
  const {data: shows, isPending} = useQuery({
    queryFn: () => tmdb.discover.tvShow({
      language: "tr-TR",
      include_adult: false,
    }),
    queryKey: [ "discover", "tr" ],
  });

  const {data: genres} = useQuery({
    queryFn: () => tmdb.genres.movies({language : "tr-TR"}),
    queryKey: [ "genres", "tr" ],
  });

  if (isPending) return <Skeleton className="relative h-screen w-full overflow-hidden" />

  return (
    <Carousel
      className="touch-none"
      isButtonDisabled={true}
      draggable={false}
      options={
        {
        duration:
          0, loop : true, dragFree : false, watchDrag : false
        }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
    >
      {shows?.results?.map((movie) => (
        <section key={movie.id} className="relative h-screen w-full overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-4xl text-white">
                <div className="mb-4 flex flex-wrap gap-2">
                  {genres && (
                    <Genres
                      genres={
                        movie.genre_ids
                          .slice(0, 5)
                          .map((id) => genres.genres.find((g) => g.id === id))
                          .filter(Boolean) as Genre[]
                      }
                    />
                  )}
                </div>

                <h1 className="mb-4 text-5xl font-extrabold drop-shadow-2xl md:text-7xl">
                  {movie.name}
                </h1>

                <div className="mb-6 flex items-center gap-6 text-lg md:text-xl">
                  <div className="flex items-center gap-2">
                    <Rating rate={movie.vote_average || 0} />
                  </div>
                  <p>&#8226;</p>
                  <span className="text-gray-300">{movie.first_air_date?.slice(0, 4)}</span>
                </div>

                <p className="mb-8 line-clamp-4 text-lg leading-relaxed text-gray-200 drop-shadow-xl md:text-xl">
                  {movie.overview || "Yok"}
                </p>

                <div className="pointer-events-auto flex gap-4">
                  <Link
                    href={`/tv/${movie.id}`}
                    className="bg-primary hover:bg-primary/70 rounded-full px-8 py-4 text-lg font-bold transition-all"
                  >
                    Hemen İzle
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0">
            <div
              className="hero-slide absolute inset-0 opacity-0 opacity-100 transition-opacity duration-1000"
              style={{ opacity: 100 }}
            >
              <img
                src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
                alt={movie.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>
          </div>
        </section>
      ))}
    </Carousel>
  );
};

export default ModernHero;
