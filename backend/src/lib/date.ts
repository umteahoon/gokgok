import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export const toUTC = (date?: Date) => (date || new Date()).toISOString();
export const fromNow = (utcDate: string) => dayjs(utcDate).fromNow();
export const formatLocal = (utcDate: string) => dayjs(utcDate).format("YYYY-MM-DD HH:mm");