import { Image } from "@heroui/image";
import { useWindowScroll } from "@mantine/hooks";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { AppendToResponse } from "tmdb-ts/dist/types/options";
import { getImageUrl } from "@/utils/movies";
import { cn } from "@/utils/helpers";

const BackdropSection: React.FC<{
  movie: AppendToResponse<MovieDetails, "images"[], "movie"> | undefined;
  isPlayer?: boolean
}> = ({ movie, isPlayer }) => {
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 1000) * 2, 1);
  const backdropImage = getImageUrl(movie?.backdrop_path, "backdrop", true);
  const titleImage = getImageUrl(
    movie?.images.logos.find((logo) => logo.iso_639_1 === "en")?.file_path,
    "title",
  );

  return (
    <section id="backdrop" className="fixed inset-0 h-[35vh] md:h-[50vh] lg:h-[70vh]">
      <div className="bg-background absolute inset-0 z-10" style={{ opacity: opacity }} />
      <div className={cn("from-background absolute inset-0 z-2 bg-linear-to-b from-1% via-transparent",
        isPlayer ? "via-100%" : "via-30%",
      )} />
      <div className={cn("from-background absolute inset-0 z-2 translate-y-px bg-linear-to-t from-1% via-transparent",
        isPlayer ? "via-100%" : "via-55%",
      )} />
      {movie?.backdrop_path && movie?.backdrop_path.trim() !== "" ? (
        <Image
          isBlurred
          radius="none"
          alt={movie?.original_language === "id" ? movie?.original_title : movie?.title}
          classNames={{ wrapper: "absolute-center z-1 bg-transparent" }}
          className="w-[25vh] max-w-80 drop-shadow-xl md:w-[60vh]"
          src={titleImage}
        />
      ) : null}
      <Image
        radius="none"
        alt={movie?.original_language === "id" ? movie?.original_title : movie?.title}
        className="z-0 h-[35vh] w-screen object-cover object-center md:h-[50vh] lg:h-[70vh]"
        src={backdropImage}
      />
    </section>
  );
};

export default BackdropSection;
