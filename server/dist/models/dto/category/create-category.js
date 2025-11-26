"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategorySchema = void 0;
const zod_1 = require("zod");
exports.CreateCategorySchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string().nonempty(),
    type: zod_1.z.string().nonempty(),
});
//# sourceMappingURL=create-category.js.map