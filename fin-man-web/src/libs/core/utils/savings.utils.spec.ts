import {
  buildMonthlyAnalysis,
  daysBetween,
  excessAmount,
  isValidIsoDate,
  monthlyContribution,
  monthsBetween,
  progressPercent,
  remainingAmount,
  sumAmounts,
  toIsoDate,
} from './savings.utils';

describe('savings.utils', () => {
  describe('dates', () => {
    it('formats local calendar dates', () => {
      expect(toIsoDate(new Date(2026, 10, 5, 23, 59))).toBe('2026-11-05');
    });

    it('validates real calendar dates only', () => {
      expect(isValidIsoDate('2028-02-29')).toBe(true);
      expect(isValidIsoDate('2027-02-29')).toBe(false);
      expect(isValidIsoDate('')).toBe(false);
      expect(isValidIsoDate(null)).toBe(false);
    });

    it('counts whole days across month and year ends', () => {
      expect(daysBetween('2026-11-05', '2026-11-05')).toBe(0);
      expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
      expect(daysBetween('2026-11-05', '2026-11-01')).toBe(-4);
      expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    });

    it('counts calendar months, not elapsed days', () => {
      expect(monthsBetween('2026-11-05', '2026-11-30')).toBe(0);
      expect(monthsBetween('2026-11-30', '2026-12-01')).toBe(1);
      expect(monthsBetween('2026-11-05', '2027-02-01')).toBe(3);
      expect(monthsBetween('2026-11-05', '2026-10-31')).toBe(-1);
    });
  });

  describe('amounts', () => {
    it('sums without floating point drift', () => {
      expect(sumAmounts([0.1, 0.2])).toBe(0.3);
      expect(sumAmounts([])).toBe(0);
    });

    it('never reports a negative remainder', () => {
      expect(remainingAmount(1000, 250.5)).toBe(749.5);
      expect(remainingAmount(1000, 1500)).toBe(0);
    });

    it('reports the excess only once the target is exceeded', () => {
      expect(excessAmount(1000, 999.99)).toBe(0);
      expect(excessAmount(1000, 1500.25)).toBe(500.25);
    });

    it('caps progress at 100 percent', () => {
      expect(progressPercent(1000, 250)).toBe(25);
      expect(progressPercent(1000, 1500)).toBe(100);
      expect(progressPercent(1000, 0)).toBe(0);
    });
  });

  describe('monthlyContribution', () => {
    const goal = (extra = {}) => ({
      targetAmount: 1200,
      targetDate: '2027-11-30',
      savedAmount: 0,
      ...extra,
    });

    it('divides the remainder by the months from today through the target month', () => {
      expect(monthlyContribution(goal(), '2026-11-05')).toBe(100);
      expect(
        monthlyContribution(goal({ savedAmount: 600 }), '2026-11-05')
      ).toBe(50);
    });

    it('asks for the full remainder in the target month', () => {
      expect(
        monthlyContribution(
          goal({ targetDate: '2026-11-30', savedAmount: 200 }),
          '2026-11-05'
        )
      ).toBe(1000);
    });

    it('asks for the full remainder once the target month has passed', () => {
      expect(
        monthlyContribution(goal({ targetDate: '2026-09-01' }), '2026-11-05')
      ).toBe(1200);
    });

    it('is zero when the target is met or exceeded', () => {
      expect(
        monthlyContribution(goal({ savedAmount: 1200 }), '2026-11-05')
      ).toBe(0);
      expect(
        monthlyContribution(goal({ savedAmount: 5000 }), '2026-11-05')
      ).toBe(0);
    });

    it('recalculates when the target amount or date changes', () => {
      const base = goal({ savedAmount: 200 });
      expect(monthlyContribution(base, '2026-11-05')).toBeCloseTo(1000 / 12);
      expect(
        monthlyContribution({ ...base, targetAmount: 2200 }, '2026-11-05')
      ).toBeCloseTo(2000 / 12);
      expect(
        monthlyContribution({ ...base, targetDate: '2026-12-31' }, '2026-11-05')
      ).toBe(1000);
    });
  });

  describe('buildMonthlyAnalysis', () => {
    const goal = {
      createdOn: '2026-09-15',
      paceTargetAmount: 1000,
      paceTargetDate: '2027-03-01',
    };
    const today = '2026-11-05';

    it('has one month from the creation month through the current month', () => {
      const { months } = buildMonthlyAnalysis(goal, [], today);
      expect(months.map((month) => month.key)).toEqual([
        '2026-09',
        '2026-10',
        '2026-11',
      ]);
      expect(months.map((month) => month.label)).toEqual([
        "Sep '26",
        "Oct '26",
        "Nov '26",
      ]);
    });

    it('shows zero for months without virtual transactions', () => {
      const { months } = buildMonthlyAnalysis(
        goal,
        [{ amount: 100, date: '2026-09-20' }],
        today
      );
      expect(months.map((month) => month.added)).toEqual([100, 0, 0]);
      expect(months.map((month) => month.saved)).toEqual([100, 100, 100]);
    });

    it('accumulates what was added each month', () => {
      const { months } = buildMonthlyAnalysis(
        goal,
        [
          { amount: 100, date: '2026-09-20' },
          { amount: 0.1, date: '2026-10-01' },
          { amount: 0.2, date: '2026-10-31' },
          { amount: 50, date: '2026-11-05' },
        ],
        today
      );
      expect(months.map((month) => month.added)).toEqual([100, 0.3, 50]);
      expect(months.map((month) => month.saved)).toEqual([100, 100.3, 150.3]);
    });

    it('counts transactions dated before the creation month in the cumulative line only', () => {
      const analysis = buildMonthlyAnalysis(
        goal,
        [
          { amount: 40, date: '2026-01-10' },
          { amount: 10, date: '2026-10-10' },
        ],
        today
      );
      expect(analysis.savedBefore).toBe(40);
      expect(analysis.months.map((month) => month.added)).toEqual([0, 10, 0]);
      expect(analysis.months.map((month) => month.saved)).toEqual([40, 50, 50]);
    });

    it('plots the saved line at month ends and today', () => {
      const { saved } = buildMonthlyAnalysis(goal, [], today);
      expect(saved.map((point) => point.x.toFixed(3))).toEqual([
        '1.000',
        '2.000',
        (2 + 5 / 30).toFixed(3),
      ]);
    });

    it('draws the pace line from zero at creation toward the target', () => {
      const { pace } = buildMonthlyAnalysis(goal, [], today);
      expect(pace[0]).toEqual({ x: 14 / 30, y: 0 });
      const total = daysBetween('2026-09-15', '2027-03-01');
      expect(pace).toHaveLength(4);
      expect(pace[1].x).toBe(1);
      expect(pace[1].y).toBeCloseTo((1000 * 16) / total);
      expect(pace[3].x).toBe(3);
      expect(pace[3].y).toBeCloseTo((1000 * daysBetween('2026-09-15', '2026-12-01')) / total);
    });

    it('ends the pace line at the target when the target date is inside the chart', () => {
      const { pace } = buildMonthlyAnalysis(
        { ...goal, paceTargetDate: '2026-10-16' },
        [],
        today
      );
      const last = pace[pace.length - 1];
      expect(last.y).toBe(1000);
      expect(last.x).toBeCloseTo(1 + 15 / 31);
    });

    it('does not move the pace line when the goal is edited', () => {
      const original = buildMonthlyAnalysis(goal, [], today).pace;
      const edited = {
        ...goal,
        targetAmount: 5000,
        targetDate: '2030-01-01',
      };
      expect(buildMonthlyAnalysis(edited, [], today).pace).toEqual(original);
    });

    it('draws a single month when the goal was created this month', () => {
      const analysis = buildMonthlyAnalysis(
        { ...goal, createdOn: '2026-11-01' },
        [{ amount: 10, date: '2026-11-02' }],
        today
      );
      expect(analysis.months).toHaveLength(1);
      expect(analysis.months[0]).toMatchObject({ added: 10, saved: 10 });
    });
  });
});
