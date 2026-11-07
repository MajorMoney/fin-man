import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SavingsService } from './savings.service';

type Row = Record<string, any>;

/** Minimal in-memory stand-in for a mongoose model. */
function fakeModel() {
  const rows: Row[] = [];
  const matches = (row: Row, filter: Row) =>
    Object.entries(filter).every(([key, value]) => row[key] === value);
  const wrap = (row: Row) =>
    Object.assign(row, {
      save: async () => row,
    });
  const query = <T>(result: () => T) => {
    const chain: any = {
      sort: (order: Row) => {
        const keys = Object.entries(order);
        const sorted = () =>
          [...(result() as any as Row[])].sort((a, b) => {
            for (const [key, dir] of keys) {
              if (a[key] === b[key]) continue;
              return (a[key] < b[key] ? -1 : 1) * (dir as number);
            }
            return 0;
          });
        return query(sorted);
      },
      exec: async () => result(),
    };
    return chain;
  };

  const Model: any = function (this: Row, data: Row) {
    const row = wrap({ ...data });
    return {
      save: async () => {
        rows.push(row);
        return row;
      },
    };
  };
  Model.rows = rows;
  Model.find = (filter: Row = {}) =>
    query(() => rows.filter((row) => matches(row, filter)));
  Model.findOne = (filter: Row) =>
    query(() => rows.find((row) => matches(row, filter)) ?? null);
  const remove = (filter: Row) => {
    const keep = rows.filter((row) => !matches(row, filter));
    const deletedCount = rows.length - keep.length;
    rows.splice(0, rows.length, ...keep);
    return query(() => ({ deletedCount }));
  };
  Model.deleteOne = (filter: Row) => {
    const index = rows.findIndex((row) => matches(row, filter));
    const deletedCount = index === -1 ? 0 : 1;
    if (index !== -1) rows.splice(index, 1);
    return query(() => ({ deletedCount }));
  };
  Model.deleteMany = remove;
  return Model;
}

describe('SavingsService', () => {
  let goals: ReturnType<typeof fakeModel>;
  let transactions: ReturnType<typeof fakeModel>;
  let service: SavingsService;
  const today = '2026-11-05';

  const goal = (extra: Row = {}) =>
    service.createGoal({
      name: 'Trip',
      targetAmount: 1000,
      targetDate: '2027-06-30',
      today,
      ...extra,
    });

  beforeEach(() => {
    goals = fakeModel();
    transactions = fakeModel();
    service = new SavingsService(goals, transactions);
  });

  it('creates a goal with no history when nothing is saved yet', async () => {
    const created = await goal({ description: '  Lisbon  ' });
    expect(created).toMatchObject({
      name: 'Trip',
      description: 'Lisbon',
      targetAmount: 1000,
      createdOn: today,
      savedAmount: 0,
      currency: 'EUR',
    });
    expect(transactions.rows).toHaveLength(0);
  });

  it('turns the amount already saved into the first virtual transaction', async () => {
    const created = await goal({ savedAmount: 250.5 });
    expect(created.savedAmount).toBe(250.5);
    expect(transactions.rows).toHaveLength(1);
    expect(transactions.rows[0]).toMatchObject({
      goalId: created.id,
      amount: 250.5,
      date: today,
    });
  });

  it('may be saved beyond the target', async () => {
    const created = await goal({ savedAmount: 1500 });
    expect((await service.findGoal(created.id)).savedAmount).toBe(1500);
  });

  it.each([
    [{ name: '   ' }],
    [{ targetAmount: 0 }],
    [{ targetAmount: -5 }],
    [{ targetAmount: 10.123 }],
    [{ targetDate: '2026-11-04' }],
    [{ targetDate: 'soon' }],
    [{ savedAmount: -1 }],
  ])('rejects an invalid goal %p', async (extra) => {
    await expect(goal(extra)).rejects.toBeInstanceOf(BadRequestException);
    expect(goals.rows).toHaveLength(0);
  });

  it('allows a target date in the current month', async () => {
    await expect(goal({ targetDate: '2026-11-05' })).resolves.toBeDefined();
  });

  it('keeps the pace baseline fixed when the goal is edited', async () => {
    const created = await goal();
    const updated = await service.updateGoal(created.id, {
      targetAmount: 2000,
      targetDate: '2028-01-31',
    });
    expect(updated.targetAmount).toBe(2000);
    expect(updated.targetDate).toBe('2028-01-31');
    expect(updated.paceTargetAmount).toBe(1000);
    expect(updated.paceTargetDate).toBe('2027-06-30');
    expect(updated.createdOn).toBe(today);
  });

  it('rejects editing the target date before the goal was created', async () => {
    const created = await goal();
    await expect(
      service.updateGoal(created.id, { targetDate: '2026-11-04' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('adds, edits and reverts virtual transactions, changing the saved amount', async () => {
    const created = await goal();
    const first = await service.createTransaction(created.id, {
      amount: 100,
      date: '2026-10-01',
      today,
    });
    const second = await service.createTransaction(created.id, {
      amount: 50.25,
      date: today,
      note: ' bonus ',
      today,
    });
    expect(second.note).toBe('bonus');
    expect((await service.findGoal(created.id)).savedAmount).toBe(150.25);

    const edited = await service.updateTransaction(created.id, first.id, {
      amount: 120,
    });
    expect(edited).toMatchObject({ id: first.id, amount: 120 });
    expect((await service.findGoal(created.id)).savedAmount).toBe(170.25);

    await service.revertTransaction(created.id, second.id);
    expect((await service.findGoal(created.id)).savedAmount).toBe(120);
    await expect(
      service.revertTransaction(created.id, second.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists virtual transactions newest first', async () => {
    const created = await goal();
    for (const date of ['2026-09-01', '2026-11-01', '2026-10-01']) {
      await service.createTransaction(created.id, { amount: 1, date, today });
    }
    const list = await service.findTransactions(created.id);
    expect(list.map((entry) => entry.date)).toEqual([
      '2026-11-01',
      '2026-10-01',
      '2026-09-01',
    ]);
  });

  it('allows dates before the goal was created but not in the future', async () => {
    const created = await goal();
    await expect(
      service.createTransaction(created.id, {
        amount: 5,
        date: '2020-01-01',
        today,
      }),
    ).resolves.toBeDefined();
    await expect(
      service.createTransaction(created.id, {
        amount: 5,
        date: '2026-11-06',
        today,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    const ok = await service.createTransaction(created.id, {
      amount: 5,
      date: today,
      today,
    });
    await expect(
      service.updateTransaction(created.id, ok.id, {
        date: '2026-11-06',
        today,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([[{ amount: 0 }], [{ amount: -3 }], [{ amount: 1.005 }]])(
    'rejects virtual transaction %p',
    async (extra) => {
      const created = await goal();
      await expect(
        service.createTransaction(created.id, {
          date: today,
          today,
          ...extra,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('does not let one goal edit or revert another goal history', async () => {
    const a = await goal();
    const b = await goal({ name: 'Car' });
    const tx = await service.createTransaction(a.id, {
      amount: 10,
      date: today,
      today,
    });
    await expect(
      service.updateTransaction(b.id, tx.id, { amount: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.revertTransaction(b.id, tx.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deleting a goal deletes its history', async () => {
    const a = await goal({ savedAmount: 10 });
    const b = await goal({ name: 'Car', savedAmount: 20 });
    await service.removeGoal(a.id);
    expect(transactions.rows.map((row) => row.goalId)).toEqual([b.id]);
    await expect(service.findGoal(a.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists goals with their saved amounts', async () => {
    const a = await goal({ savedAmount: 10.1 });
    await service.createTransaction(a.id, { amount: 0.2, date: today, today });
    const b = await goal({ name: 'Car' });
    const list = await service.findAllGoals();
    expect(list.find((g) => g.id === a.id)?.savedAmount).toBe(10.3);
    expect(list.find((g) => g.id === b.id)?.savedAmount).toBe(0);
  });
});
