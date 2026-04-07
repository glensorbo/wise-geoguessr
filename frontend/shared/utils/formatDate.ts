import dayjs from 'dayjs';

/**
 * Formats a date or ISO timestamp for display.
 *
 * - Date-only values (midnight) → `YYYY-MM-DD`
 * - Values with a time component  → `YYYY-MM-DD HH:mm`
 *
 * All values are displayed in the user's local timezone.
 */
export const formatDate = (value: string | Date): string => {
  const d = dayjs(value);
  const hasTime = d.hour() !== 0 || d.minute() !== 0 || d.second() !== 0;
  return hasTime ? d.format('YYYY-MM-DD HH:mm') : d.format('YYYY-MM-DD');
};
