import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getHostname } from "@/lib/utils.js";

export default function MediaLinkPill({ href }) {
  if (!href) return null;
  return (
    <div className="flex justify-center">
      <Badge
        className="cursor-pointer my-2 border-none!"
        variant="secondary"
        render={<a href={href} target="_blank" rel="noopener noreferrer" />}
      >
        {getHostname(href)}
        <ArrowUpRight />
      </Badge>
    </div>
  );
}
