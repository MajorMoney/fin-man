"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountSchema = void 0;
const zod_1 = require("zod");
exports.CreateAccountSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string().nonempty(),
    holdings: zod_1.z.number(),
    holders: zod_1.z.array(zod_1.z.string()).min(1, 'Accounts must have at least one holder'),
});
//# sourceMappingURL=create-account.dto.js.map