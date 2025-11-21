// 默认的弹出动画配置
export const popUpVariants = {
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 0.3,
      bounce: 0.2,
      ease: "easeInOut",
    },
  },
  exit: {
    y: -30,
    opacity: 0,
    transition: {
      type: "spring",
      duration: 0.3,
      bounce: 0.2,
      ease: "easeInOut",
    },
  },
};
