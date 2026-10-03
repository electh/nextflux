import { useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { articleMotion, reducedArticleMotion } from "../articleMotion.js";

export default function ArticleTransition({
  children,
  direction,
  reduceMotion,
  scrollAreaRef,
}) {
  useLayoutEffect(() => {
    // AnimatePresence mounts this article only after the previous one exits.
    // Reset before paint so the outgoing article keeps its reading position.
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [scrollAreaRef]);

  return (
    <motion.div
      custom={direction}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduceMotion ? reducedArticleMotion : articleMotion}
      className="w-full min-w-0 min-h-[calc(100dvh-4rem)]"
    >
      {children}
    </motion.div>
  );
}
