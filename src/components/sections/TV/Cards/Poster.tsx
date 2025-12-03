import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl, mutateTvShowTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { Genre, TV } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import TvShowHoverCard from "./Hover";
import Genres from "@/components/ui/other/Genres";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";

interface TvShowPosterCardProps {
  tv: TV;
  variant?: "full" | "bordered";
}

const TvShowPosterCard: React.FC<TvShowPosterCardProps> = ({ tv, variant = "full" }) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = new Date(tv.first_air_date).getFullYear();
  const posterImage = getImageUrl(tv.poster_path);
  const title = mutateTvShowTitle(tv);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => tmdb.genres.tvShows({ language: "tr-TR" }),
  });

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  const isNew = (() => {
    const now = new Date();
    const release = new Date(tv.first_air_date);
    const diff = (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  })();

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={1000}
        placement="right-start"
        content={<TvShowHoverCard id={tv.id} />}
      >
        <Link href={`/tv/${tv.id}`} ref={ref} {...longPress()}>
          {variant === "full" && (
            <div className="group motion-preset-focus hover:border-warning relative aspect-2/3 overflow-hidden rounded-lg border-[3px] border-transparent text-white transition-colors">
              {hovered && (
                <Icon
                  icon="line-md:play-filled"
                  width="64"
                  height="64"
                  className="absolute-center z-20 text-white"
                />
              )}
              <div className="absolute top-2 left-2 z-20 flex flex-row gap-2">
                {isNew && (
                  <Chip color="danger" size="sm" variant="shadow">
                    Yeni Bölüm
                  </Chip>
                )}
                {tv.adult && (
                  <Chip color="danger" size="sm" variant="shadow">
                    18+
                  </Chip>
                )}
              </div>
              <div className="absolute bottom-0 z-2 h-1/2 w-full bg-linear-to-t from-black from-1%"></div>
              <div className="absolute bottom-0 z-3 flex w-full flex-col gap-1 px-4 py-3">
                <h3 className="line-clamp-2 text-lg leading-tight font-bold">{title}</h3>
                <div className="flex gap-2 text-xs">
                  <p>{releaseYear}</p>
                  <p>&#8226;</p>
                  <Rating rate={tv.vote_average} />
                </div>
                {genres && (
                  <Genres
                    isLink={false}
                    genres={
                      tv.genre_ids
                        .slice(0, 2)
                        .map((id) => genres.genres.find((g) => g.id === id))
                        .filter(Boolean) as Genre[]
                    }
                  />
                )}
              </div>
              <Image
                alt={title}
                src={posterImage}
                radius="none"
                className="z-0 aspect-2/3 h-[250px] object-cover object-center transition group-hover:scale-110 md:h-[300px]"
                classNames={{
                  img: "group-hover:opacity-70",
                }}
              />
            </div>
          )}

          {variant === "bordered" && (
            <Card
              isHoverable
              fullWidth
              shadow="md"
              className="group bg-secondary-background h-full"
            >
              <CardHeader className="flex items-center justify-center pb-0">
                <div className="relative size-full">
                  {hovered && (
                    <Icon
                      icon="line-md:play-filled"
                      width="64"
                      height="64"
                      className="absolute-center z-20 text-white"
                    />
                  )}
                  {tv.adult && (
                    <Chip
                      color="danger"
                      size="sm"
                      variant="shadow"
                      className="absolute top-2 left-2 z-20"
                    >
                      18+
                    </Chip>
                  )}
                  <div className="rounded-large relative overflow-hidden">
                    <Image
                      isBlurred
                      alt={title}
                      className="aspect-2/3 rounded-lg object-cover object-center group-hover:scale-110"
                      src={posterImage}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="text-md truncate font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs">
                <p>{releaseYear}</p>
                <Rating rate={tv.vote_average} />
              </CardFooter>
            </Card>
          )}
        </Link>
      </Tooltip>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          <TvShowHoverCard id={tv.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};

export default TvShowPosterCard;
