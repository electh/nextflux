export const articleMotion = {
  hidden: (direction = 1) => ({ y: 48 * direction, opacity: 0 }),
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction = 1) => ({
    y: -48 * direction,
    opacity: 0,
    transition: { duration: 0.22, delay: 0, ease: [0.4, 0, 1, 1] },
  }),
};

const still = { y: 0, opacity: 1, transition: { duration: 0, delay: 0 } };
export const reducedArticleMotion = {
  hidden: still,
  visible: still,
  exit: still,
};
