import {
  addDays,
  buildBurnup,
  daysBetween,
  excessAmount,
  formatDayLabel,
  formatMonthLabel,
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

    it('labels a month with the shared abbreviations', () => {
      expect(formatMonthLabel('2026-11-08', false)).toBe("Nov '26");
      expect(formatMonthLabel('2026-11-08', true)).toBe('8 Nov');
      expect(formatDayLabel('2026-11-08')).toBe("8 Nov '26");
    });

    it('adds calendar days across month and year ends', () => {
      expect(addDays('2026-09-15', 0)).toBe('2026-09-15');
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addDays('2026-11-05', -4)).toBe('2026-11-01');
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

  describe('buildBurnup', () => {
    const goal = {
      createdOn: '2026-09-15',
      targetAmount: 1000,
      targetDate: '2027-03-01',
    };
    const today = '2026-11-05';

    it('holds a flat line at zero from creation through today', () => {
      const analysis = buildBurnup(goal, [], today);
      expect(analysis.end).toBe(today);
      expect(analysis.span).toBe(daysBetween(goal.createdOn, today));
      expect(analysis.cursor).toBe(analysis.span);
      expect(analysis.goal).toBe(1000);
      expect(analysis.current).toBe(0);
      expect(analysis.gap).toBe(1000);
      expect(analysis.steps).toEqual([
        { x: 0, y: 0 },
        { x: analysis.cursor, y: 0 },
      ]);
    });

    it('steps the cumulative amount on each deposit and stops at today', () => {
      const analysis = buildBurnup(
        goal,
        [
          { amount: 50, date: '2026-11-05' },
          { amount: 100, date: '2026-09-20' },
          { amount: 0.1, date: '2026-10-01' },
          { amount: 0.2, date: '2026-10-31' },
        ],
        today
      );
      const sep20 = daysBetween('2026-09-15', '2026-09-20');
      const oct1 = daysBetween('2026-09-15', '2026-10-01');
      const oct31 = daysBetween('2026-09-15', '2026-10-31');
      expect(analysis.steps).toEqual([
        { x: 0, y: 0 },
        { x: sep20, y: 0 },
        { x: sep20, y: 100 },
        { x: oct1, y: 100 },
        { x: oct1, y: 100.1 },
        { x: oct31, y: 100.1 },
        { x: oct31, y: 100.3 },
        { x: analysis.cursor, y: 100.3 },
        { x: analysis.cursor, y: 150.3 },
      ]);
      expect(analysis.current).toBe(150.3);
      expect(analysis.gap).toBe(849.7);
      expect(analysis.cursor).toBe(analysis.span);
      expect(analysis.steps.every((step) => step.x <= analysis.cursor)).toBe(
        true
      );
    });

    it('starts from money dated before the goal was created', () => {
      const analysis = buildBurnup(
        goal,
        [
          { amount: 40, date: '2026-01-10' },
          { amount: 10, date: '2026-10-10' },
        ],
        today
      );
      const oct10 = daysBetween('2026-09-15', '2026-10-10');
      expect(analysis.savedBefore).toBe(40);
      expect(analysis.steps[0]).toEqual({ x: 0, y: 40 });
      expect(analysis.steps).toContainEqual({ x: oct10, y: 40 });
      expect(analysis.steps).toContainEqual({ x: oct10, y: 50 });
      expect(analysis.current).toBe(50);
    });

    it('ends the axis on today once the target date has passed', () => {
      const analysis = buildBurnup(
        { ...goal, targetDate: '2026-10-01' },
        [],
        today
      );
      expect(analysis.end).toBe(today);
      expect(analysis.cursor).toBe(analysis.span);
    });

    it('follows the current goal when the target amount changes', () => {
      const analysis = buildBurnup(
        { ...goal, targetAmount: 5000, targetDate: '2030-01-01' },
        [{ amount: 100, date: '2026-09-20' }],
        today
      );
      expect(analysis.goal).toBe(5000);
      expect(analysis.end).toBe(today);
      expect(analysis.gap).toBe(4900);
    });

    it('reports a negative gap once the cumulative amount passes the goal', () => {
      const analysis = buildBurnup(
        goal,
        [{ amount: 1250.25, date: '2026-10-01' }],
        today
      );
      expect(analysis.current).toBe(1250.25);
      expect(analysis.gap).toBe(-250.25);
    });

    it('raises the monthly goal by one installment at each month boundary', () => {
      const analysis = buildBurnup(goal, [], today, 'monthly');
      const installment = Math.floor(100000 / 6) / 100;
      const oct1 = daysBetween('2026-09-15', '2026-10-01');
      const nov1 = daysBetween('2026-09-15', '2026-11-01');
      const mar1 = daysBetween('2026-09-15', '2027-03-01');
      expect(analysis.end).toBe('2027-03-01');
      expect(analysis.cursor).toBeLessThan(analysis.span);
      expect(analysis.plan[0]).toEqual({ x: 0, y: 0 });
      expect(analysis.plan).toContainEqual({ x: oct1, y: 0 });
      expect(analysis.plan).toContainEqual({ x: oct1, y: installment });
      expect(analysis.plan).toContainEqual({ x: nov1, y: installment * 2 });
      expect(analysis.plan[analysis.plan.length - 1]).toEqual({
        x: mar1,
        y: 1000,
      });
      expect(analysis.planned).toBe(installment * 2);
      expect(analysis.gap).toBe(analysis.planned);
      expect(analysis.steps[analysis.steps.length - 1].x).toBe(analysis.cursor);
    });

    it('puts the whole monthly goal on the target date inside the creation month', () => {
      const analysis = buildBurnup(
        { ...goal, targetDate: '2026-09-20' },
        [],
        today,
        'monthly'
      );
      const due = daysBetween('2026-09-15', '2026-09-20');
      expect(analysis.plan).toContainEqual({ x: due, y: 0 });
      expect(analysis.plan).toContainEqual({ x: due, y: 1000 });
      expect(analysis.planned).toBe(1000);
      expect(analysis.end).toBe(today);
    });

    it('measures the monthly gap against the plan due by today', () => {
      const analysis = buildBurnup(
        goal,
        [{ amount: 400, date: '2026-10-10' }],
        today,
        'monthly'
      );
      expect(analysis.current).toBe(400);
      expect(analysis.gap).toBeCloseTo(analysis.planned - 400);
      expect(analysis.gap).toBeLessThan(0);
    });

    it('keeps a goal created today as a single point', () => {
      const analysis = buildBurnup(
        { ...goal, createdOn: today, targetDate: today },
        [{ amount: 10, date: today }],
        today
      );
      expect(analysis.span).toBe(0);
      expect(analysis.cursor).toBe(0);
      expect(analysis.steps).toEqual([
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ]);
    });
  });
});
