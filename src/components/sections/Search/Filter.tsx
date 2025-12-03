"use client";

import { getSearchSuggestions } from "@/actions/search";
import SearchInput from "@/components/ui/input/SearchInput";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import Highlight from "@/components/ui/other/Highlight";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { SEARCH_HISTORY_STORAGE_KEY } from "@/utils/constants";
import { cn, isEmpty } from "@/utils/helpers";
import { ArrowUpLeft, Close, History, Movie, Search, TV } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import { Button, Listbox, ListboxItem } from "@heroui/react";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useState } from "react";

interface SearchFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  onSearchSubmit?: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ isLoading, onSearchSubmit, ...props }) => {
  const router = useRouter();
  const [triggered, setTriggered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const [searchHistories, setSearchHistories] = useLocalStorage<string[]>({
    key: SEARCH_HISTORY_STORAGE_KEY,
    defaultValue: [],
  });
  const enableFetch = debouncedSearchQuery.length > 3 && !isLoading && !triggered;
  const { data, isFetching } = useQuery({
    enabled: enableFetch,
    queryKey: ["search-suggestions", debouncedSearchQuery],
    queryFn: async () => await getSearchSuggestions(debouncedSearchQuery),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
  const showSuggestions = enableFetch && !isFetching;
  const showHistory = !showSuggestions && !isEmpty(searchHistories) && !isLoading && !triggered;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setTriggered(!isEmpty(searchQuery));
      onSearchSubmit?.(searchQuery);
      if (searchQuery && !searchHistories.includes(searchQuery)) {
        const newHistories = [...searchHistories, searchQuery];
        if (newHistories.length > 5) {
          newHistories.shift();
        }
        setSearchHistories(newHistories);
      }
    },
    [searchQuery, searchHistories],
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setTriggered(false);
    onSearchSubmit?.("");
  }, []);

  return (
    <div className={cn("relative flex w-full max-w-sm items-center gap-2")} {...props}>
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <SearchInput
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={`Stranger Things`}
            isLoading={isLoading}
            value={searchQuery}
            onValueChange={(val) => {
              setSearchQuery(val);
              if (isEmpty(val)) setTriggered(false);
            }}
            onClear={!isEmpty(searchQuery) ? handleClear : undefined}
            className="h-10 text-sm"
          />
        </div>

        {isFocused &&
          searchQuery.length > 0 &&
          (showSuggestions || showHistory) &&
          !(showSuggestions && isEmpty(data?.data)) && (
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Listbox
                  variant="flat"
                  emptyContent={<p className="p-2 text-center text-xs">Sonuç Bulunamadı</p>}
                  className="bg-content1 rounded-medium absolute top-11 z-50 w-full shadow-xl"
                  classNames={{
                    list: "max-h-[12rem] overflow-y-auto",
                  }}
                >
                  {(data?.data || []).map(({ id, title, type }, index) => (
                    <ListboxItem
                      key={`suggestion-${index}`}
                      className="text-sm"
                      startContent={
                        type === "movie" ? (
                          <Movie className="text-primary" size={15} />
                        ) : (
                          <TV className="text-warning" size={15} />
                        )
                      }
                      endContent={
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="size-6"
                          onPress={() => setSearchQuery(title)}
                        >
                          <ArrowUpLeft size={14} />
                        </Button>
                      }
                      onPress={() => router.push(`/${type}/${id}`)}
                    >
                      <Highlight markType="bold" highlight={debouncedSearchQuery}>
                        {title}
                      </Highlight>
                    </ListboxItem>
                  ))}
                </Listbox>
              </motion.div>
            </AnimatePresence>
          )}
      </div>
    </div>
  );
};

export default SearchFilter;
