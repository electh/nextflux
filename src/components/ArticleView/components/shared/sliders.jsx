import { TimeSlider } from "@vidstack/react";
import {
  CurrentTime,
  Duration,
} from "@/components/ArticleView/components/shared/time-group.jsx";

export function Time() {
  return (
    <div className="audio-player-slider w-full">
      <TimeSlider.Root className="group relative inline-flex w-full cursor-pointer touch-none select-none items-center outline-hidden aria-hidden:hidden">
        <TimeSlider.Track className="relative ring-primary z-0 h-1.5 w-full rounded-full bg-content3 group-data-focus:ring-[3px]">
          <TimeSlider.TrackFill className="bg-primary z-20 absolute h-full w-(--slider-fill) rounded-full will-change-[width]" />
          <TimeSlider.Progress className="absolute z-10 h-full w-(--slider-progress) rounded-full bg-transparent will-change-[width]" />
        </TimeSlider.Track>

        <TimeSlider.Preview
          className="flex flex-col items-center opacity-0 transition-opacity duration-200 data-visible:opacity-100 pointer-events-none"
          noClamp
        >
          <TimeSlider.Value className="rounded bg-content1 px-2 py-1 mb-2 text-xs font-medium text-default-500 shadow-custom" />
        </TimeSlider.Preview>

        <TimeSlider.Thumb className="absolute left-(--slider-fill) top-1/2 z-20 h-4 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-custom bg-white ring-primary/40 transition-size group-data-active:h-5 group-data-active:w-6 group-data-dragging:ring-4 will-change-[left]" />
      </TimeSlider.Root>

      <div className="flex justify-between">
        <CurrentTime />
        <Duration />
      </div>
    </div>
  );
}
