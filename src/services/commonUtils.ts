export interface getScheduleServiceProps {
  userId: string;
  offset: number;
  viewType: "day" | "month" | "year";
  particularDate: Date;
}
export default class CommonUtlis {
  static calculate_start_and_end_dates(
    viewType: string,
    offset: number,
    baseDate?: Date // optional parameter
  ) {
    const now = baseDate ? new Date(baseDate) : new Date();
    let start: Date, end: Date;

    if (viewType === "day") {
      start = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + offset
        )
      );
      end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 1);
    } else if (viewType === "week") {
      const currentDayOfWeek = now.getUTCDay(); // Sunday = 0
      start = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - currentDayOfWeek + offset * 7
        )
      );
      end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 7);
    } else {
      // month
      start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)
      );
      end = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 1)
      );
    }

    return { start, end };
  }
}
