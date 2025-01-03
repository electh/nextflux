import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.locale("zh-cn");

export const formatLastSync = (date) => {
  if (!date) return "从未同步";
  return dayjs(date).calendar(null, {
    sameDay: "[今天] HH:mm",
    lastDay: "[昨天] HH:mm",
    sameElse: "YYYY-MM-DD HH:mm",
  });
};

export const formatPublishDate = (date) => {
  return dayjs(date).fromNow();
};

export const generateReadableDate = (dateString) =>
  dayjs(dateString).format("YYYY年MM月DD日 HH:mm · dddd");
