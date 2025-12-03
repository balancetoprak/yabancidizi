import { getSavedMovieIds, getSavedShowIds } from "@/actions/movies";
import { tmdb } from "@/api/tmdb";
import { SiteConfigType } from "@/types";
import { Movie, TV } from "@/utils/icons";
import { BiSearchAlt2, BiSolidSearchAlt2 } from "react-icons/bi";
import { GoHomeFill, GoHome } from "react-icons/go";
import { HiComputerDesktop } from "react-icons/hi2";
import { IoIosSunny } from "react-icons/io";
import {
  IoCompass,
  IoCompassOutline,
  IoInformationCircle,
  IoInformationCircleOutline,
  IoMoon,
} from "react-icons/io5";
import { TbDeviceIpadStar, TbFolder, TbFolderFilled } from "react-icons/tb";

export async function filterTMDBResults(results: any[], category: string) {
  const savedItems = (await getSavedMovieIds(category))?.flat() ?? [];
  return results.filter((m) => savedItems.includes(m.id));
}

export async function filterTMDBShowResults(results: any[], category: string) {
  const savedItems = (await getSavedShowIds(category))?.flat() ?? [];
  return results.filter((m) => savedItems.includes(m.id));
}

export const siteConfig: SiteConfigType = {
  name: "Yabancı Dizi",
  description: "pff",
  favicon: "/favicon.ico",
  navItems: [
    {
      label: "Ana Sayfa",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "Diziler",
      href: "/?content=tv",
      icon: <TV className="size-full" />,
      activeIcon: <TV className="size-full" />,
    },
    {
      label: "Filmler",
      href: "/",
      icon: <Movie className="size-full" />,
      activeIcon: <Movie className="size-full" />,
    },
    {
      label: "Favoriler",
      href: "/library",
      icon: <TbFolderFilled className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
  ],
  themes: [
    {
      name: "light",
      icon: <IoIosSunny className="size-full" />,
    },
    {
      name: "dark",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "system",
      icon: <HiComputerDesktop className="size-full" />,
    },
  ],
  queryLists: {
    movies: [
      {
        name: "Just Releases",
        query: async () => {
          const response = await tmdb.discover.movie({ language: "tr-TR" });
          const filtered = await filterTMDBResults(response.results, "just-releases");
          if (!filtered.length) return response;

          return {
            ...response,
            results: filtered,
          };
        },
        param: "todayTrending",
      },
      {
        name: "Popular of The Week",
        query: async () => {
          const response = await tmdb.trending.trending("movie", "week");
          const filtered = await filterTMDBResults(response.results, "popular-week");
          if (!filtered.length) return response;

          return {
            ...response,
            results: filtered,
          };
        },
        param: "thisWeekTrending",
      },
      {
        name: "Yeni Çıkan Filmler",
        query: async () => {
          const response = await tmdb.movies.nowPlaying({ language: "tr-TR", page: 1 });
          const filtered = await filterTMDBResults(response.results, "newest");
          if (!filtered.length) return response;

          return {
            ...response,
            results: filtered,
          };
        },
        param: "newest",
      },
    ],
    tvShows: [
      {
        name: "Just Releases",
        query: async () => {
          const today = new Date().toISOString().split("T")[0];
          const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

          const response = await tmdb.discover.tvShow({
            language: "tr-TR",
            "first_air_date.gte": lastWeek,
            "first_air_date.lte": today,
            sort_by: "first_air_date.desc",
            page: 1,
          });
          const filtered = await filterTMDBShowResults(response.results, "just-releases");
          if (!filtered.length) return response;

          return {
            ...response,
            results: filtered,
          };
        },
        param: "todayTrending",
      },
      {
        name: "Popular of The Week",
        query: () => tmdb.trending.trending("tv", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Yeni Bölümler",
        query: async () => {
          const response = await tmdb.discover.tvShow({
            language: "tr-TR",
            "air_date.gte": new Date(Date.now() - 259200000).toISOString().split("T")[0],
            "air_date.lte": new Date().toISOString().split("T")[0],
            sort_by: "first_air_date.desc",
            page: 1,
          });
          const filtered = await filterTMDBShowResults(response.results, "just-releases");
          if (!filtered.length) return response;

          return {
            ...response,
            results: filtered,
          };
        },
        param: "newest",
      },

      {
        name: "Yeni Çıkan Filmler",
        // @ts-expect-error: 'OnTheAirResult' türünde 'adult' özelliği eksik ancak 'TV' türünde gerekli.
        query: () => tmdb.tvShows.onTheAir({ language: "tr-TR" }),
        param: "onTheAir",
      },
    ],
  },
  socials: {
    github: "https://github.com/mishuw",
  },
};

export type SiteConfig = typeof siteConfig;
