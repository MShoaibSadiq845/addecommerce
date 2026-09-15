import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { buildDefaultReviews } from '../reviews/default-reviews.data';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerwebsocket';

async function runAudit() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  const db = mongoose.connection.db;
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

    // Clean any old reviews for this product
    await reviewsCollection.deleteMany({ productId: productIdStr });

    const freshReviews = buildDefaultReviews(
      productIdStr,
      product.name || 'Product',
      i * 3,
      7,
      [],
      [],
    );

    await reviewsCollection.insertMany(freshReviews);
    createdReviewsCount += freshReviews.length;
    updatedProductsCount++;

    const totalRating = freshReviews.reduce(
      (sum, r) => sum + (Number(r.rating) || 5),
      0,
    );
    const avgRating =
      Math.round((totalRating / freshReviews.length) * 10) / 10;

    await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: {
          rating: avgRating,
          numReviews: freshReviews.length,
        },
      },
    );

    console.log(
      `[✓] Product "${product.name}" (${productIdStr}): 7 UNIQUE reviews -> ${freshReviews.map((r) => r.name).join(', ')}`,
    );
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('Audit Summary:');
  console.log(`- Total products audited: ${products.length}`);
  console.log(`- Products updated: ${updatedProductsCount}`);
  console.log(`- Reviews created: ${createdReviewsCount}`);
  console.log('═══════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('MongoDB disconnected.');
}

runAudit().catch((err) => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
