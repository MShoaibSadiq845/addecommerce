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
const default_reviews_data_1 = require("../reviews/default-reviews.data");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerwebsocket';
async function runAudit() {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected successfully.');
    const db = mongoose_1.default.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }
    const productsCollection = db.collection('products');
    const reviewsCollection = db.collection('reviews');
    const products = await productsCollection.find().toArray();
    console.log(`Found ${products.length} products to audit.`);
    let updatedProductsCount = 0;
    let createdReviewsCount = 0;
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productIdStr = product._id.toString();
        const existingReviews = await reviewsCollection
            .find({ productId: productIdStr })
            .toArray();
        const count = existingReviews.length;
        if (count < 7) {
            const defaultReviews = (0, default_reviews_data_1.buildDefaultReviews)(productIdStr, product.name || 'Product', i);
            const neededCount = 7 - count;
            const reviewsToInsert = defaultReviews.slice(0, neededCount);
            if (reviewsToInsert.length > 0) {
                await reviewsCollection.insertMany(reviewsToInsert);
                createdReviewsCount += reviewsToInsert.length;
                updatedProductsCount++;
                const allReviews = await reviewsCollection
                    .find({ productId: productIdStr })
                    .toArray();
                const totalRating = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
                const avgRating = Math.round((totalRating / allReviews.length) * 10) / 10;
                await productsCollection.updateOne({ _id: product._id }, {
                    $set: {
                        rating: avgRating,
                        numReviews: allReviews.length,
                    },
                });
                console.log(`[✓] Product "${product.name}" (${productIdStr}): Added ${reviewsToInsert.length} reviews. Total: ${allReviews.length}, Rating: ${avgRating}`);
            }
        }
        else {
            console.log(`[-] Product "${product.name}" (${productIdStr}): Already has ${count} reviews. Skipped.`);
        }
    }
    console.log('\n═══════════════════════════════════════════');
    console.log('Audit Summary:');
    console.log(`- Total products audited: ${products.length}`);
    console.log(`- Products updated: ${updatedProductsCount}`);
    console.log(`- Reviews created: ${createdReviewsCount}`);
    console.log('═══════════════════════════════════════════\n');
    await mongoose_1.default.disconnect();
    console.log('MongoDB disconnected.');
}
runAudit().catch((err) => {
    console.error('Audit script failed:', err);
    process.exit(1);
});
//# sourceMappingURL=audit-reviews.js.map