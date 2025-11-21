import logo from "@/assets/logo.png";
import { Image } from "@heroui/react";

export const NotFancyLogo = ({ since }) => {
  return (
    <div className="flex flex-col perspective-midrange p-5 bg-content2 dark:bg-transparent dark:border-b">
      <div className="group relative w-full flex flex-col gap-6 py-6 items-center overflow-hidden rounded-lg bg-transparent text-[#01A977]">
        <Image
          src={logo}
          alt="logo"
          classNames={{ wrapper: "size-24", image: "aspect-square" }}
        />
        <footer className="flex items-end">
          <span className="flex rounded-xs border border-current px-1 py-px text-xs uppercase">
            NEXTFLUX{" "}
            <span className="-my-px mx-1 inline-block w-4 border-l border-r border-current bg-[repeating-linear-gradient(-45deg,currentColor,currentColor_1px,transparent_1px,transparent_2px)]" />{" "}
            {since}
          </span>
        </footer>
      </div>
    </div>
  );
};
