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

    // Check existing reviews for this product
    const existingReviews = await reviewsCollection
      .find({ productId: productIdStr })
      .toArray();

    const count = existingReviews.length;

    if (count < 3) {
      const defaultReviews = buildDefaultReviews(
        productIdStr,
        product.name || 'Product',
        i,
      );

      const neededCount = 3 - count;
      const reviewsToInsert = defaultReviews.slice(0, neededCount);

      if (reviewsToInsert.length > 0) {
        await reviewsCollection.insertMany(reviewsToInsert);
        createdReviewsCount += reviewsToInsert.length;
        updatedProductsCount++;

        // Fetch all reviews now to compute accurate average rating
        const allReviews = await reviewsCollection
          .find({ productId: productIdStr })
          .toArray();

        const totalRating = allReviews.reduce(
          (sum, r) => sum + (Number(r.rating) || 5),
          0,
        );
        const avgRating =
          Math.round((totalRating / allReviews.length) * 10) / 10;

        await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              rating: avgRating,
              numReviews: allReviews.length,
            },
          },
        );

        console.log(
          `[✓] Product "${product.name}" (${productIdStr}): Added ${reviewsToInsert.length} reviews. Total: ${allReviews.length}, Rating: ${avgRating}`,
        );
      }
    } else {
      console.log(
        `[-] Product "${product.name}" (${productIdStr}): Already has ${count} reviews. Skipped.`,
      );
    }
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
