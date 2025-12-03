"use client";

import { User } from "@heroui/react";
import { Cast } from "tmdb-ts";
import { getImageUrl } from "@/utils/movies";
import Carousel from "@/components/ui/wrapper/Carousel";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { Image } from "@heroui/react";

interface CastCardProps {
  casts: Cast[];
}

const CastsSection: React.FC<CastCardProps> = ({ casts }) => {
  return (
    <section id="casts" className="z-3 flex flex-col gap-2">
      <SectionTitle>Oyuncular</SectionTitle>
      <Carousel classNames={{ container: "gap-5" }}>
        {casts.map((cast, index) => {
          const avatar = getImageUrl(cast.profile_path, "avatar");
          return (
            <div key={index} className="flex max-w-fit items-center px-1 py-2">
              <div className="bg-dark-3/40 flex flex-col items-center gap-2 rounded-2xl border border-white/5 p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10">
                <Image
                  alt={cast.name}
                  src={avatar}
                  radius="none"
                  className="h-20 w-20 rounded-full object-cover shadow-md transition-all hover:scale-110"
                />
                <p className="text-center text-sm leading-tight font-semibold text-white">
                  {cast.name}
                </p>
                <span className="max-w-full truncate rounded-full bg-white/10 px-3 py-1 text-[11px] text-gray-300">
                  {cast.character}
                </span>
              </div>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default CastsSection;
