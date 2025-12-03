"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getComments, addComment } from "@/actions/comment";
import { Suspense, useMemo, useState } from "react";
import {
  Image,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  Checkbox,
  Button,
} from "@heroui/react";
import { timeAgo } from "@/utils/movies";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { User } from "@/utils/icons";
import { env } from "@/utils/env";
import useSupabaseUser from "@/hooks/useSupabaseUser";

interface CommentProps {
  id: number;
}

interface CommentItemProps {
  comment: any;
  onLike: () => void;
}

const CommentItem = ({ comment, onLike }: CommentItemProps) => {
  return (
    <div className="mb-4 rounded-2xl border border-gray-800 bg-[#0f0f0f] p-6 transition-all duration-300 hover:border-gray-700">
      <CommentHeader comment={comment} />
      <CommentContent content={comment.content} />
      <CommentActions comment={comment} onLike={onLike} />
    </div>
  );
};

const CommentHeader = ({ comment }: { comment: any }) => (
  <div className="mb-4 flex items-start gap-4">
    <Avatar
      showFallback
      src={`${env.NEXT_PUBLIC_AVATAR_PROVIDER_URL}${comment.profiles?.avatar}`}
      className="size-7"
      fallback={<User className="text-xl" />}
    />
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-start justify-between">
        <div className="truncate text-base font-semibold text-white">
          {comment.profiles?.username || "Anonim"}
        </div>
        <div className="ml-2 flex-shrink-0 text-xs text-gray-400">
          {timeAgo(comment.created_at)}
        </div>
      </div>
    </div>
  </div>
);

const CommentContent = ({ content }: { content: string }) => (
  <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">{content}</div>
);

const CommentActions = ({ comment, onLike }: { comment: any; onLike: () => void }) => {
  const [isLiked, setIsLiked] = useState(comment?.liked || false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
      {/* <LikeButton isLiked={isLiked} onClick={handleLike} likeCount={0} /> */}
      <CommentMenu />
    </div>
  );
};

const LikeButton = ({
  isLiked,
  onClick,
  likeCount,
}: {
  isLiked: boolean;
  onClick: () => void;
  likeCount: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 ${
      isLiked
        ? "border border-blue-500/30 bg-blue-500/20 text-blue-400"
        : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
    }`}
    aria-label={isLiked ? "Beğenmekten vazgeç" : "Beğen"}
  >
    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
    </svg>
    <span className="text-sm font-medium">{likeCount}</span>
  </button>
);

const CommentMenu = () => (
  <Dropdown showArrow closeOnSelect={false} className="w-10">
    <DropdownTrigger className="w-10">
      <button
        className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-800 hover:text-gray-300"
        aria-label="Yorum seçenekleri"
      >
        <DotsIcon />
      </button>
    </DropdownTrigger>
    <DropdownMenu aria-label="Yorum detayları" variant="flat">
      <DropdownItem key="delete" color="danger">
        Sil
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

const DotsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
    />
  </svg>
);

const EmptyComments = () => (
  <div className="py-8 text-center">
    <svg
      className="mx-auto mb-4 h-12 w-12 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
    <p className="text-gray-500">Henüz yorum yok. İlk yorumu sen yap!</p>
  </div>
);

const CommentSection: React.FC<CommentProps> = ({ id }) => {
  const [comment, setComment] = useState("");
  const { data: user, isLoading } = useSupabaseUser();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } =
    useInfiniteQuery({
      queryKey: ["comments", id],
      queryFn: async ({ pageParam = 1 }) => {
        return await getComments(id, pageParam, 20);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasNextPage) {
          return pages.length + 1;
        }
        return undefined;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    });

  const sorted = useMemo(() => {
    if (!data?.pages) return [];

    const allItems = data.pages.flatMap((page) => page.data || []);

    return [...allItems].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [data?.pages]);

  const handleSubmit = async () => {
    try {
      await addComment({
        author: user?.id as string,
        movie_id: id,
        content: comment,
      });
      setComment("");
      refetch();
    } catch (error) {
      console.error("Error updating watchlist:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (isLoading) return null;

  return (
    <section id="casts" className="z-3 flex flex-col gap-2">
      <SectionTitle>İncelemeler</SectionTitle>
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto mt-6 max-w-4xl">
          {user && (
            <div className="mb-8 rounded-2xl border border-gray-800 bg-[#0f0f0f] p-6 shadow-lg transition-all duration-300 hover:border-gray-700">
              <div className="flex gap-4">
                <Avatar
                  showFallback
                  src={`${env.NEXT_PUBLIC_AVATAR_PROVIDER_URL}${user?.avatar}`}
                  className="size-10"
                  fallback={<User className="text-xl" />}
                />

                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Bu bölüm hakkında ne düşünüyorsun?"
                    className="w-full resize-none rounded-xl border border-gray-700 bg-[#1a1a1a] px-4 py-4 text-sm leading-relaxed text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={3}
                  />

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      {/* <LikeButton isLiked={isLiked} onClick={handleLike} likeCount={0} /> */}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Ctrl + Enter ile hızlı gönder!
                      </div>
                    </div>

                    <Button
                      onPress={handleSubmit}
                      disabled={!comment.trim()}
                      className={`flex transform items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                        comment.trim()
                          ? "bg-[#2d2d2d] text-white hover:shadow-xl"
                          : "cursor-not-allowed bg-gray-700 text-gray-400"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {sorted && sorted.length > 0 ? (
            <div className="space-y-4">
              {sorted.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onLike={() => {}} />
              ))}
            </div>
          ) : (
            <EmptyComments />
          )}
        </div>
      </section>
    </section>
  );
};

export default CommentSection;
