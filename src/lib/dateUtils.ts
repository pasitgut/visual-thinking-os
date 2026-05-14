import {
  format,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from "date-fns";

export const getDeadlineLabel = (deadline?: string) => {
  if (!deadline || deadline === "No deadline") return "ยังไม่มีกำหนด";
  try {
    const date = parseISO(deadline);
    const today = startOfDay(new Date());
    if (isToday(date)) return "วันนี้";
    if (isTomorrow(date)) return "พรุ่งนี้";
    if (isBefore(date, today)) return "เลยกำหนดแล้ว!";
    return format(date, "d MMM");
  } catch {
    return "ยังไม่มีกำหนด";
  }
};

export const getDeadlineStyles = (deadline?: string) => {
  if (!deadline || deadline === "No deadline")
    return "text-muted-foreground/40 hover:text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5";

  try {
    const date = parseISO(deadline);
    const today = startOfDay(new Date());

    if (isBefore(date, today)) {
      return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
    }
    if (isToday(date)) {
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/40";
    }
    if (isTomorrow(date)) {
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40";
    }
    return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800";
  } catch {
    return "text-muted-foreground/40 hover:text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5";
  }
};
