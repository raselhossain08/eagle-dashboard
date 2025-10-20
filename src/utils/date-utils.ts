import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

export const formatDateRange = (start: Date, end: Date): string => {
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
};

export const getDefaultDateRange = () => {
  const end = new Date();
  const start = subDays(end, 30);
  return { start, end };
};

export const presetRanges = {
  today: {
    label: 'Today',
    value: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
  },
  last7Days: {
    label: 'Last 7 days',
    value: {
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    },
  },
  last30Days: {
    label: 'Last 30 days',
    value: {
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    },
  },
  last90Days: {
    label: 'Last 90 days',
    value: {
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
    },
  },
};