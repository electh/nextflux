import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import FeedIcon from "@/components/ui/FeedIcon";
import { Image } from "@/components/ui/Image.jsx";

export default function ResultListbox({ results, searchType, handleSelect }) {
  if (!results.length) return null;
  return (
    <>
      <Separator className="my-1" />
      <ToggleGroup
        orientation="vertical"
        spacing={1}
        aria-label="results"
        className="max-h-60 min-w-0 w-full items-stretch overflow-x-hidden overflow-y-auto rounded-xl bg-secondary/60 p-1"
        onValueChange={(values) => {
          if (values.length) handleSelect(values);
        }}
      >
        {results.map((item) => (
          <ToggleGroupItem
            key={item.url}
            value={item.url}
            aria-label={item.title || item.url}
            className="h-auto min-w-0 w-full justify-start py-2"
          >
            {searchType === "podcast" ? (
              <Image
                src={item.icon_url}
                alt={item.title}
                className="size-8 shrink-0 rounded-sm object-cover shadow-custom"
              />
            ) : (
              <FeedIcon feedId={null} url={item.url} />
            )}
            <span className="flex min-w-0 flex-1 flex-col text-left">
              <span className="w-full truncate" title={item.title || item.url}>
                {item.title || item.url}
              </span>
              <span className="w-full truncate text-xs text-muted-foreground" title={item.url}>
                {item.url}
              </span>
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  );
}
