import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
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
        className="max-h-60 w-full items-stretch overflow-y-auto rounded-xl bg-default/60 p-1"
        onValueChange={(values) => {
          if (values.length) handleSelect(values);
        }}
      >
        {results.map((item) => (
          <ToggleGroupItem
            key={item.url}
            value={item.url}
            aria-label={item.title || item.url}
            className="h-auto w-full justify-start py-2"
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
            <span className="flex min-w-0 flex-col items-start">
              <span className="line-clamp-1">{item.title || item.url}</span>
              <span
                className={cn("line-clamp-1 text-xs text-muted-foreground")}
              >
                {item.url}
              </span>
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  );
}
