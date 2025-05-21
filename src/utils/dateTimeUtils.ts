// dateTimeUtils.ts
// src/utils/dateTimeUtils.ts

import { format } from 'date-fns-tz';

export function formatDateAU(dateStrOrObj: string | Date): string {
  const date = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
  return format(date, 'dd/MM/yyyy', { timeZone: 'Australia/Brisbane' }); // Default to AEST
}

export function formatTimeAU(dateStrOrObj: string | Date): string {
  const date = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
  return format(date, 'hh:mm a', { timeZone: 'Australia/Brisbane' });
}
