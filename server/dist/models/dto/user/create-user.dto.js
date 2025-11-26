"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string().nonempty(),
    income: zod_1.z.number(),
});
//# sourceMappingURL=create-user.dto.js.map