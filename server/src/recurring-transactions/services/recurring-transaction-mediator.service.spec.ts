import { NotFoundException } from '@nestjs/common';
import { RecurringTransactionMediatorService } from './recurring-transaction-mediator.service';

describe('RecurringTransactionMediatorService.processAll', () => {
  it('keeps processing later rules when one account no longer exists', async () => {
    const rules = [
      { id: 1, description: 'Updated subscription', nextDueDate: '2026-09-20' },
      { id: 2, description: 'Rent', nextDueDate: '2026-10-01' },
    ];
    const recurringService = {
      findAll: jest.fn().mockResolvedValue(rules),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const processingService = {
      processRule: jest
        .fn()
        .mockResolvedValueOnce({
          transactions: [{ account: 'Test', amount: 10 }],
          nextDueDate: '2026-11-20',
        })
        .mockResolvedValueOnce({
          transactions: [{ account: 'Bankinter', amount: 5 }],
          nextDueDate: '2026-11-01',
        }),
    };
    const transactionService = {
      create: jest
        .fn()
        .mockRejectedValueOnce(
          new NotFoundException('Account Test does not exist'),
        )
        .mockResolvedValueOnce({}),
    };
    const incidentsService = {
      report: jest.fn().mockResolvedValue({ id: 99 }),
    };

    const service = new RecurringTransactionMediatorService(
      recurringService as never,
      processingService as never,
      transactionService as never,
      incidentsService as never,
    );

    await expect(service.processAll()).resolves.toBeUndefined();
    expect(processingService.processRule).toHaveBeenCalledTimes(2);
    expect(transactionService.create).toHaveBeenCalledTimes(2);
    expect(incidentsService.report).toHaveBeenCalledWith({
      source: 'recurring-transaction',
      sourceId: 1,
      title: 'Recurring "Updated subscription" failed',
      message: 'Account Test does not exist',
    });
    expect(recurringService.update).toHaveBeenCalledWith(2, {
      nextDueDate: '2026-11-01',
    });
    expect(recurringService.update).not.toHaveBeenCalledWith(
      1,
      expect.anything(),
    );
  });
});
