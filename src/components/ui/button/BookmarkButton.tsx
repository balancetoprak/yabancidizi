"use client";

import { useEffect, useState, useTransition } from "react";
import { BsBookmarkCheckFill, BsBookmarkFill } from "react-icons/bs";
import { addToast } from "@heroui/react";
import IconButton from "./IconButton";
import { Trash } from "@/utils/icons";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { SavedMovieDetails } from "@/types/movie";
import { addToWatchlist, removeFromWatchlist, checkInWatchlist } from "@/actions/library";
import { queryClient } from "@/app/providers";
import { usePathname } from "next/navigation";

interface BookmarkButtonProps {
  data: SavedMovieDetails;
  isTooltipDisabled?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ data, isTooltipDisabled }) => {
  const pathname = usePathname();
  const { startVibration } = useDeviceVibration();
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!user) {
        setIsChecking(false);
        setIsSaved(false);
        return;
      }

      setIsChecking(true);
      try {
        const result = await checkInWatchlist(data.id, data.type);
        if (result.success) {
          setIsSaved(result.isInWatchlist);
        }
      } catch (error) {
        console.error("Error checking watchlist status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWatchlistStatus();
  }, [user, data.id, data.type]);

  const handleBookmark = () => {
    if (!user) {
      addToast({
        title: "Bu özelliği kullanmak için oturum açmış olmanız gerekir",
        color: "warning",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (isSaved) {
          const result = await removeFromWatchlist(data.id, data.type);

          if (result.success) {
            setIsSaved(false);

            addToast({
              title: `${data.title} favori listenizden kaldırıldı!`,
              color: "danger",
              icon: <Trash />,
            });

            if (pathname.startsWith("/library")) {
              queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            }
          } else {
            addToast({
              title: "Hata",
              description: result.error || "Favori listesinden çıkarılamadı",
              color: "danger",
            });
          }
        } else {
          const watchlistItem = {
            id: data.id,
            type: data.type,
            adult: data.adult,
            backdrop_path: data.backdrop_path,
            poster_path: data.poster_path || null,
            release_date: data.release_date,
            title: data.title,
            vote_average: data.vote_average,
          };

          const result = await addToWatchlist(watchlistItem);

          if (result.success) {
            setIsSaved(true);
            startVibration([100]);
            addToast({
              title: `${data.title} favori listenize eklendi!`,
              color: "success",
            });
          } else {
            if (result.error === "Bu öğe zaten favori listenizde") {
              setIsSaved(true);
              addToast({
                title: "Zaten favori listesinde",
                description: `${data.title} zaten favori listenizde`,
                color: "warning",
              });
            } else {
              addToast({
                title: "Hata",
                description: result.error || "favori listesine eklenemedi",
                color: "danger",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error updating watchlist:", error);
        addToast({
          title: "Error",
          description: "Beklenmeyen bir hata oluştu",
          color: "danger",
        });
      }
    });
  };

  return (
    <IconButton
      onPress={handleBookmark}
      icon={isSaved ? <BsBookmarkCheckFill size={20} /> : <BsBookmarkFill size={20} />}
      variant={isSaved ? "shadow" : "faded"}
      color="warning"
      isLoading={isUserLoading || isChecking || isPending}
      tooltip={
        isTooltipDisabled ? undefined : isSaved ? "Favorilerimden Kaldır" : "Favorilerime Ekle"
      }
    />
  );
};

export default BookmarkButton;
