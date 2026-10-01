export const NotFancyLogo = ({ since }) => {
  return (
    <div className="flex flex-col perspective-midrange p-0 dark:bg-transparent dark:border-b">
      <div className="group relative w-full flex flex-col gap-6 py-6 items-center overflow-hidden rounded-lg bg-transparent text-primary">
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
