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

  static calculate_last_period_including_date_for_progress(
    viewType: string,
    offset: number,
    baseDate?: Date
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
      if (offset === -1) {
        // For offset -1, include the given date as the end of the 7-day period
        start = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 6 // 6 days before the given date
          )
        );
        end = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1 // End of the given date
          )
        );
      } else {
        // For other offsets, use the original week logic
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
      }
    } else {
      // month
      if (offset === -1) {
        // For offset -1, include the given date as the end of a 30-day period
        start = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 29 // 29 days before the given date
          )
        );
        end = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1 // End of the given date
          )
        );
      } else {
        // For other offsets, use the original month logic
        start = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)
        );
        end = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 1)
        );
      }
    }

    return { start, end };
  }
}
