import { getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';

export const getLastNFridays = (n: number): DateValue[] => {
  const fridays: DateValue[] = [];
  let current = today(getLocalTimeZone());

  // Find the most recent Friday (or today if it's Friday)
  const dayOfWeek = current.toDate(getLocalTimeZone()).getDay();
  let daysToSubtract = (dayOfWeek + 2) % 7;
  if (daysToSubtract === 0 && dayOfWeek !== 5) {
    daysToSubtract = 7;
  }
  current = current.subtract({ days: daysToSubtract });

  for (let i = 0; i < n; i++) {
    fridays.push(current);
    current = current.subtract({ days: 7 });
  }

  return fridays;
};

export const parseDateString = (dateStr: string): Date => {
  return parseDate(dateStr).toDate(getLocalTimeZone());
};
