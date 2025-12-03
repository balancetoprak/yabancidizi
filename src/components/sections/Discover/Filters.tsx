import GenresSelect from "@/components/ui/input/GenresSelect";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { Select, SelectItem, Button } from "@heroui/react";

const DiscoverFilters = () => {
  const { types, content, genres, queryType, setQueryType, setGenres, resetFilters } =
    useDiscoverFilters();

  return (
    <div className="flex w-full flex-wrap justify-center gap-3">
      <div className="flex w-full flex-wrap justify-center gap-3">
        <Select
          disallowEmptySelection
          selectionMode="single"
          size="sm"
          label="Tür"
          placeholder="Tür seçin"
          className="max-w-xs"
          selectedKeys={[queryType]}
          onChange={({ target }) => {
            setQueryType(target.value as DiscoverMoviesFetchQueryType);
            setGenres(null);
          }}
          value={queryType}
        >
          {types.map(({ name, key }) => {
            return <SelectItem key={key}>{name}</SelectItem>;
          })}
        </Select>
        <GenresSelect
          type={content}
          selectedKeys={genres}
          onGenreChange={(genres) => {
            setGenres(genres);
            setQueryType("discover");
          }}
        />
      </div>
      <Button size="sm" onPress={resetFilters}>
        Filtre Temizle
      </Button>
    </div>
  );
};

export default DiscoverFilters;
