/** Calendar day `YYYY-MM-DD` stored as midnight UTC. */
export function calendarDayToUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function utcToCalendarDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}
