import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { syncPriceInDescription } from '../products/utils/price-description.util';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerwebsocket';

async function runMigration() {
  console.log('🔄 Connecting to MongoDB for description price migration...');
  console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

  await mongoose.connect(MONGODB_URI);
  console.log(' Connected to database successfully.');

  const db = mongoose.connection.db;
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

    const updatedDesc = syncPriceInDescription(currentDesc, currentPrice);

    if (updatedDesc !== currentDesc) {
      await productsCollection.updateOne(
        { _id: product._id },
        { $set: { description: updatedDesc } },
      );
      updatedCount++;
      console.log(
        `[✓] Updated product (${product._id}) "${product.name}" price: Rs. ${currentPrice}\n` +
        `    Old Desc snippet: ${currentDesc.slice(-60)}\n` +
        `    New Desc snippet: ${updatedDesc.slice(-60)}\n`
      );
    } else {
      skippedCount++;
    }
  }

  console.log('\n═════════════════════════════════════════════════════');
  console.log('🎉 Description Price Migration Complete!');
  console.log(`- Total products scanned: ${products.length}`);
  console.log(`- Products updated:       ${updatedCount}`);
  console.log(`- Unchanged / skipped:    ${skippedCount}`);
  console.log('═════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected.');
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
