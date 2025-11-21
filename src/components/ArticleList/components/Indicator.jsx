import { ArrowUp } from "lucide-react";
import { visibleRange } from "@/stores/articlesStore.js";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";

export default function Indicator({ virtuosoRef }) {
  const $visibleRange = useStore(visibleRange);

  const handleClick = () => {
    virtuosoRef.current?.scrollToIndex({
      index: 0,
      align: "start",
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      {$visibleRange.startIndex !== 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
          className="indicator absolute cursor-pointer select-none right-2 mt-14 standalone:mt-safe-offset-14 rounded-full bg-background/70 backdrop-blur-2xl z-10 shadow-custom py-1 px-2 flex gap-0.5 items-center font-mono text-xs font-medium text-default-500"
        >
          {$visibleRange.startIndex}
          <ArrowUp strokeWidth={3} className="size-3 text-default-400" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
