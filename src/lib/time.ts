import { formatInTimeZone } from 'date-fns-tz';

export function ymdInTz(date: Date, tz: string): string {
  return formatInTimeZone(date, tz, 'yyyy-MM-dd');
}

export function getUserTz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
