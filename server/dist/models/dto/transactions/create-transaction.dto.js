"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionSchema = void 0;
const zod_1 = require("zod");
exports.CreateTransactionSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    type: zod_1.z.enum(['income', 'expense']),
    date: zod_1.z.string().nonempty(),
    description: zod_1.z.string().nonempty(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string().optional(),
    account: zod_1.z.string().optional(),
    category: zod_1.z.string().nonempty(),
    notes: zod_1.z.string().optional(),
    user: zod_1.z.string().nonempty(),
    recurring: zod_1.z.boolean().optional(),
    recurrenceRule: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
//# sourceMappingURL=create-transaction.dto.js.map