import { BadRequestException } from '@nestjs/common';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function utcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function assertDate(value: unknown, label: string): string {
  const match = typeof value === 'string' ? ISO_DATE.exec(value) : null;
  if (!match) {
    throw new BadRequestException(`${label} must be a date (YYYY-MM-DD)`);
  }
  const [year, month, day] = [match[1], match[2], match[3]].map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const real =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
  if (!real) {
    throw new BadRequestException(`${label} is not a valid date`);
  }
  return value as string;
}

/**
 * The caller's calendar day. Containers run in UTC, so the client says what day
 * it is. When the client omits it, the server's UTC day is used.
 */
export function resolveToday(clientToday?: string, now = new Date()): string {
  if (clientToday == null || clientToday === '') return utcToday(now);
  return assertDate(clientToday, 'Today');
}

export function assertAmount(value: unknown, label: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new BadRequestException(`${label} is required`);
  }
  if (!(value > 0)) {
    throw new BadRequestException(`${label} must be greater than 0`);
  }
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
    throw new BadRequestException(
      `${label} cannot have more than 2 decimal places`,
    );
  }
  return value;
}

export function assertText(
  value: unknown,
  label: string,
  required: boolean,
): string {
  if (value == null) {
    if (required) throw new BadRequestException(`${label} is required`);
    return '';
  }
  if (typeof value !== 'string') {
    throw new BadRequestException(`${label} must be text`);
  }
  const text = value.trim();
  if (required && !text) {
    throw new BadRequestException(`${label} is required`);
  }
  return text;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + toCents(amount), 0) / 100;
}
