
export interface getScheduleServiceProps {
  userId: string;
  offset: number;
  viewType: "day" | "month" | "year";
}
export default class CommonUtlis {
  static calculate_start_and_end_dates(viewType: string, offset: number) {
    const now = new Date();
    let start: Date, end: Date;
    if (viewType === "day") {
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset
      );
      end = new Date(start);
      end.setDate(start.getDate() + 1);
    } else if (viewType === "week") {
      const currentDayOfWeek = now.getDay(); // Sunday = 0
      start = new Date(now);
      start.setDate(now.getDate() - currentDayOfWeek + offset * 7);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 7);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    }
    return {start, end};
  }
}
