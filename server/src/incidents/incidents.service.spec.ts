import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IncidentsService } from './incidents.service';

type Row = Record<string, any>;

function fakeModel() {
  const rows: Row[] = [];
  const matches = (row: Row, filter: Row) =>
    Object.entries(filter).every(([key, value]) => row[key] === value);
  const wrap = (row: Row) => Object.assign(row, { save: async () => row });
  const query = <T>(result: () => T) => {
    const chain: any = {
      sort: () => query(result),
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
  Model.deleteOne = (filter: Row) => {
    const index = rows.findIndex((row) => matches(row, filter));
    const deletedCount = index === -1 ? 0 : 1;
    if (index !== -1) rows.splice(index, 1);
    return query(() => ({ deletedCount }));
  };
  return Model;
}

describe('IncidentsService', () => {
  let model: ReturnType<typeof fakeModel>;
  let service: IncidentsService;

  beforeEach(() => {
    model = fakeModel();
    service = new IncidentsService(model);
  });

  it('creates an open incident', async () => {
    const created = await service.create({
      source: 'recurring-transaction',
      sourceId: 7,
      title: 'Recurring failed',
      message: 'Account Test does not exist',
    });
    expect(created).toMatchObject({
      source: 'recurring-transaction',
      sourceId: 7,
      title: 'Recurring failed',
      message: 'Account Test does not exist',
      status: 'open',
    });
    expect(created.createdAt).toBeDefined();
  });

  it('reuses the open incident for the same source', async () => {
    const first = await service.report({
      source: 'recurring-transaction',
      sourceId: 7,
      title: 'Recurring failed',
      message: 'Account Test does not exist',
    });
    const second = await service.report({
      source: 'recurring-transaction',
      sourceId: 7,
      title: 'Recurring failed again',
      message: 'Account Test does not exist',
    });
    expect(second.id).toBe(first.id);
    expect(second.title).toBe('Recurring failed again');
    expect(model.rows).toHaveLength(1);
  });

  it('lists open incidents only when asked', async () => {
    const open = await service.create({
      source: 'recurring-transaction',
      title: 'Open',
      message: 'still broken',
    });
    const resolved = await service.create({
      source: 'recurring-transaction',
      title: 'Done',
      message: 'fixed',
      status: 'resolved',
    });
    const listed = await service.findAll('open');
    expect(listed.map((item) => item.id)).toEqual([open.id]);
    expect((await service.findAll()).map((item) => item.id)).toEqual(
      expect.arrayContaining([open.id, resolved.id]),
    );
  });

  it('updates and deletes', async () => {
    const created = await service.create({
      source: 'recurring-transaction',
      title: 'Open',
      message: 'broken',
    });
    const updated = await service.update(created.id, { status: 'resolved' });
    expect(updated.status).toBe('resolved');
    await service.remove(created.id);
    await expect(service.findOne(created.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it.each([[{ title: '' }], [{ source: '' }], [{ status: 'nope' as any }]])(
    'rejects %p',
    async (extra) => {
      await expect(
        service.create({
          source: 'recurring-transaction',
          title: 'Ok',
          message: 'broken',
          ...extra,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});
