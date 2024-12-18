import { Inbox } from "lucide-react";

export default function EmptyPlaceholder() {
  return (
    <div className="hidden sm:flex sm:flex-1 bg-content2 p-2 h-screen">
      <div className="flex flex-col items-center gap-2 w-full justify-center h-full text-default-400">
        <Inbox className="size-16" />
        请选择文章
      </div>
    </div>
  );
}
