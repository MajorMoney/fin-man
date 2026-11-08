import { BadRequestException } from '@nestjs/common';
import {
  assertAmount,
  assertDate,
  resolveToday,
  sumAmounts,
} from './savings.utils';

describe('savings.utils', () => {
  describe('assertAmount', () => {
    it('accepts positive amounts with up to 2 decimals', () => {
      expect(assertAmount(0.01, 'Amount')).toBe(0.01);
      expect(assertAmount(125.5, 'Amount')).toBe(125.5);
    });

    it.each([0, -1, NaN, '5', null, undefined, 1.234])(
      'rejects %p',
      (value) => {
        expect(() => assertAmount(value, 'Amount')).toThrow(
          BadRequestException,
        );
      },
    );
  });

  describe('assertDate', () => {
    it('accepts real calendar dates', () => {
      expect(assertDate('2028-02-29', 'Date')).toBe('2028-02-29');
    });

    it.each(['2027-02-29', '2026-13-01', '2026-1-1', 'nope', '', 5])(
      'rejects %p',
      (value) => {
        expect(() => assertDate(value, 'Date')).toThrow(BadRequestException);
      },
    );
  });

  describe('resolveToday', () => {
    const now = new Date('2026-11-05T23:30:00Z');

    it('defaults to the server UTC day', () => {
      expect(resolveToday(undefined, now)).toBe('2026-11-05');
    });

    it('uses the client day, including one in the past', () => {
      expect(resolveToday('2026-11-06', now)).toBe('2026-11-06');
      expect(resolveToday('2024-01-15', now)).toBe('2024-01-15');
    });

    it('rejects a client day that is not a real date', () => {
      expect(() => resolveToday('2026-02-31', now)).toThrow(
        BadRequestException,
      );
    });
  });

  it('sums amounts without floating point drift', () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    expect(sumAmounts([])).toBe(0);
  });
});
