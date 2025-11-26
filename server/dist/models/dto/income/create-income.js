"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIncomeSchema = void 0;
const zod_1 = require("zod");
exports.CreateIncomeSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    date: zod_1.z.string().nonempty(),
    description: zod_1.z.string().nonempty(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string().optional(),
    account: zod_1.z.string(),
    category: zod_1.z.string(),
    source: zod_1.z.string().optional(),
    recurring: zod_1.z.boolean().optional(),
    recurrenceRule: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    user: zod_1.z.string().nonempty(),
});
//# sourceMappingURL=create-income.js.map