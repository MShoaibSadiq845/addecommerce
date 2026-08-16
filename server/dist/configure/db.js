"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'EcommerceWebApplicationSocket',
    connectionOptions: {
        family: 4,
        serverSelectionTimeoutMS: 5000,
    },
}));
//# sourceMappingURL=db.js.map