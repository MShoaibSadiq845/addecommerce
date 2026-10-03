"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const price_description_util_1 = require("../products/utils/price-description.util");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerwebsocket';
async function runMigration() {
    console.log('🔄 Connecting to MongoDB for description price migration...');
    console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
    await mongoose_1.default.connect(MONGODB_URI);
    console.log(' Connected to database successfully.');
    const db = mongoose_1.default.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }
    const productsCollection = db.collection('products');
    const products = await productsCollection.find().toArray();
    console.log(`📦 Found ${products.length} products to audit.`);
    let updatedCount = 0;
    let skippedCount = 0;
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const currentDesc = product.description || '';
        const currentPrice = Number(product.price) || 0;
        if (!currentDesc) {
            skippedCount++;
            continue;
        }
        const updatedDesc = (0, price_description_util_1.syncPriceInDescription)(currentDesc, currentPrice);
        if (updatedDesc !== currentDesc) {
            await productsCollection.updateOne({ _id: product._id }, { $set: { description: updatedDesc } });
            updatedCount++;
            console.log(`[✓] Updated product (${product._id}) "${product.name}" price: Rs. ${currentPrice}\n` +
                `    Old Desc snippet: ${currentDesc.slice(-60)}\n` +
                `    New Desc snippet: ${updatedDesc.slice(-60)}\n`);
        }
        else {
            skippedCount++;
        }
    }
    console.log('\n═════════════════════════════════════════════════════');
    console.log('🎉 Description Price Migration Complete!');
    console.log(`- Total products scanned: ${products.length}`);
    console.log(`- Products updated:       ${updatedCount}`);
    console.log(`- Unchanged / skipped:    ${skippedCount}`);
    console.log('═════════════════════════════════════════════════════\n');
    await mongoose_1.default.disconnect();
    console.log('🔌 MongoDB disconnected.');
}
runMigration().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-description-prices.js.map