import { isWithinInterval, addDays } from "date-fns";

export function isRangeAvailable(
  range: { from: Date; to: Date },
  bookedDates: { date_debut: string | Date; date_fin: string | Date }[]
): boolean {
  // Normalize range dates to start of day
  const start = new Date(range.from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(range.to);
  end.setHours(0, 0, 0, 0);

  // Check every day in the requested range
  let current = start;
  while (current <= end) {
    // Check if current day is within any booked interval
    const isBooked = bookedDates.some(booking => {
      const bStart = new Date(booking.date_debut);
      bStart.setHours(0, 0, 0, 0);
      const bEnd = new Date(booking.date_fin);
      bEnd.setHours(0, 0, 0, 0);

      return current >= bStart && current <= bEnd;
    });

    if (isBooked) return false;
    current = addDays(current, 1);
  }

  return true;
}
