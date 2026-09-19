import { Injectable, NotFoundException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReviewsService } from '../reviews/reviews.service';

export interface ProductQuery {
  category?: string;
  isOnSale?: boolean | string;
  newArrivals?: boolean | string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  color?: string | string[];
  size?: string | string[];
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewsService: ReviewsService,
  ) {}

  async onModuleInit() {
    try {
      await this.productModel.updateMany(
        { brand: { $in: ['SHOP.CO', 'shop.co', 'FebDecore', '', null] } },
        { $set: { brand: 'Fab Decor' } },
      );

      // Auto-sync seatPricing for all sofa products where seatPricing is missing or outdated
      const sofaProducts = await this.productModel.find({
        $or: [
          { name: { $regex: /sofa/i } },
          { category: { $regex: /sofa/i } },
          { tags: { $in: [/sofa/i] } },
          { seatPricing: { $exists: true, $ne: {} } },
        ],
      }).exec();

      const SEAT_TIERS: Record<string, number> = {
        '1 seats': 1,
        '2 seats': 2,
        '3 seats': 3,
        '2(1+1)': 2,
        '5(3+1+1)': 5,
        '5(3+2)': 5,
        '6(3+2+1)': 6,
        '7(3+2+1+1)': 7,
      };

      for (const prod of sofaProducts) {
        const basePrice = Number(prod.price) || 0;
        if (basePrice > 0) {
          const currentSeat1 = Number(prod.seatPricing?.['1 seats']) || 0;
          const needsSync =
            !prod.seatPricing ||
            Object.keys(prod.seatPricing).length < 8 ||
            currentSeat1 !== basePrice;

          if (needsSync) {
            const updatedSeatPricing: Record<string, number> = {};
            Object.entries(SEAT_TIERS).forEach(([key, multiplier]) => {
              updatedSeatPricing[key] = basePrice * multiplier;
            });

            // Also update description if it contains outdated "Price: Rs. xxx per seat"
            let updatedDesc = prod.description;
            if (updatedDesc && /Price:\s*Rs\.?\s*\d+\s*per seat/i.test(updatedDesc)) {
              updatedDesc = updatedDesc.replace(
                /Price:\s*Rs\.?\s*\d+\s*per seat/gi,
                `Price: Rs. ${basePrice} per seat`,
              );
            }

            await this.productModel.updateOne(
              { _id: prod._id },
              {
                $set: {
                  seatPricing: updatedSeatPricing,
                  ...(updatedDesc !== prod.description ? { description: updatedDesc } : {}),
                },
              },
            ).exec();
          }
        }
      }
      console.log('✅ Sofa product seatPricing synchronized successfully.');
    } catch (err) {
      console.error('Failed to migrate product brands/seatPricing to Fab Decor:', err);
    }
  }

  private normalizeArrayParam(value?: string | string[]): string[] {
    if (value === undefined) return [];
    const values = Array.isArray(value) ? value : String(value).split(',');
    return values.map((v) => v.trim()).filter(Boolean);
  }

  async findAll(query: ProductQuery) {
    const {
      category,
      isOnSale,
      newArrivals,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      color,
      size,
    } = query;

    const filters: any[] = [];
    const baseFilter: any = {};

    if (category) {
      baseFilter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (isOnSale !== undefined) {
      baseFilter.isOnSale =
        isOnSale === true || String(isOnSale).toLowerCase() === 'true';
    }

    // New Arrivals: products created within the last 7 days, excluding sale items
    if (newArrivals === true || String(newArrivals).toLowerCase() === 'true') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      baseFilter.createdAt = { $gte: oneWeekAgo };
      baseFilter.isOnSale = { $ne: true };
    }

    if (Object.keys(baseFilter).length) filters.push(baseFilter);

    if (minPrice !== undefined || maxPrice !== undefined) {
      // Check against effective price (salePrice if on sale, otherwise regular price)
      const priceConditions: any[] = [];
      
      if (minPrice !== undefined && maxPrice !== undefined) {
        // Both min and max specified
        priceConditions.push({
          $or: [
            { isOnSale: true, salePrice: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
            { isOnSale: { $ne: true }, price: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
          ],
        });
      } else if (minPrice !== undefined) {
        // Only min specified
        priceConditions.push({
          $or: [
            { isOnSale: true, salePrice: { $gte: Number(minPrice) } },
            { isOnSale: { $ne: true }, price: { $gte: Number(minPrice) } },
          ],
        });
      } else if (maxPrice !== undefined) {
        // Only max specified
        priceConditions.push({
          $or: [
            { isOnSale: true, salePrice: { $lte: Number(maxPrice) } },
            { isOnSale: { $ne: true }, price: { $lte: Number(maxPrice) } },
          ],
        });
      }
      
      if (priceConditions.length) filters.push(...priceConditions);
    }

    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      });
    }

    // Filter by colors array field
    const colors = this.normalizeArrayParam(color);
    if (colors.length) {
      filters.push({
        colors: { $in: colors.map((c) => new RegExp(c, 'i')) },
      });
    }

    // Filter by sizes array field
    const sizes = this.normalizeArrayParam(size);
    if (sizes.length) {
      filters.push({
        sizes: { $in: sizes.map((s) => new RegExp(s, 'i')) },
      });
    }

    const finalFilter =
      filters.length > 1 ? { $and: filters } : filters[0] || {};

    // For price sorting, we need to use aggregation to calculate effective price
    const needsPriceSorting = sort === 'price-asc' || sort === 'price-desc';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await this.productModel.countDocuments(finalFilter);

    let products: ProductDocument[];

    if (needsPriceSorting) {
      // Use aggregation pipeline to sort by effective price
      const sortDirection = sort === 'price-asc' ? 1 : -1;
      
      products = await this.productModel.aggregate([
        { $match: finalFilter },
        {
          $addFields: {
            effectivePrice: {
              $cond: {
                if: '$isOnSale',
                then: '$salePrice',
                else: '$price',
              },
            },
          },
        },
        { $sort: { effectivePrice: sortDirection } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]).exec();
    } else {
      // Regular sorting for non-price fields
      let sortOptions: any = { createdAt: -1 };
      if (sort === 'rating' || sort === 'most-popular') sortOptions = { totalSales: -1 };
      else if (sort === 'newest') sortOptions = { createdAt: -1 };

      products = await this.productModel
        .find(finalFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .exec();
    }

    return {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    };
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = await new this.productModel(dto).save();
    try {
      if (this.reviewsService) {
        await this.reviewsService.generateDefaultReviewsForProduct(
          product._id.toString(),
          product.name,
        );
      }
    } catch (err) {
      console.error('Failed to attach default reviews on product creation:', err);
    }
    const updatedProduct = await this.productModel.findById(product._id).exec();
    return updatedProduct || product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.productModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Product not found');

    const updateData: any = { ...dto };

    if (dto.price !== undefined) {
      const newPrice = Number(dto.price);
      updateData.price = newPrice;

      const isSofa =
        (existing.seatPricing && Object.keys(existing.seatPricing).length > 0) ||
        /sofa/i.test(existing.name || '') ||
        /sofa/i.test(existing.category || '') ||
        (existing.tags && existing.tags.some((t: string) => /sofa/i.test(t)));

      if (isSofa && !dto.seatPricing) {
        const SEAT_TIERS: Record<string, number> = {
          '1 seats': 1,
          '2 seats': 2,
          '3 seats': 3,
          '2(1+1)': 2,
          '5(3+1+1)': 5,
          '5(3+2)': 5,
          '6(3+2+1)': 6,
          '7(3+2+1+1)': 7,
        };
        const updatedSeatPricing: Record<string, number> = {};
        Object.entries(SEAT_TIERS).forEach(([key, mult]) => {
          updatedSeatPricing[key] = newPrice * mult;
        });
        updateData.seatPricing = updatedSeatPricing;

        if (existing.description && /Price:\s*Rs\.?\s*\d+\s*per seat/i.test(existing.description)) {
          updateData.description = existing.description.replace(
            /Price:\s*Rs\.?\s*\d+\s*per seat/gi,
            `Price: Rs. ${newPrice} per seat`,
          );
        }
      }
    }

    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
      .exec();
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product removed successfully' };
  }

  async toggleSale(id: string, isOnSale: boolean, salePrice?: number) {
    const updateData: any = { isOnSale };
    if (salePrice !== undefined) updateData.salePrice = salePrice;
    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }

  // Return distinct colors and sizes for dynamic filter options
  async getFilterOptions() {
    const [colors, sizes, categories] = await Promise.all([
      this.productModel.distinct('colors').exec(),
      this.productModel.distinct('sizes').exec(),
      this.productModel.distinct('category').exec(),
    ]);
    return {
      colors: colors.filter(Boolean).sort(),
      sizes: sizes.filter(Boolean).sort(),
      categories: categories.filter(Boolean).sort(),
    };
  }

  async getLowStockProducts(threshold = 6) {
    return this.productModel
      .find({ stock: { $lt: threshold } })
      .select('name stock sku images price category')
      .sort({ stock: 1 })
      .exec();
  }

  async bulkUpdatePrices(items: { id: string; price: number; salePrice?: number; isOnSale?: boolean }[]) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: true, count: 0, matchedCount: 0, modifiedCount: 0, message: 'No items to update' };
    }

    const SEAT_TIERS: Record<string, number> = {
      '1 seats': 1,
      '2 seats': 2,
      '3 seats': 3,
      '2(1+1)': 2,
      '5(3+1+1)': 5,
      '5(3+2)': 5,
      '6(3+2+1)': 6,
      '7(3+2+1+1)': 7,
    };

    const ids = items.map((item) => item.id);
    const existingProducts = await this.productModel.find({ _id: { $in: ids } }).exec();
    const productMap = new Map(existingProducts.map((p) => [p._id.toString(), p]));

    const bulkOps: any[] = [];

    for (const item of items) {
      const existing = productMap.get(item.id);
      if (!existing) continue;

      const newPrice = Number(item.price);
      if (isNaN(newPrice) || newPrice < 0) continue;

      const updateFields: any = {
        price: newPrice,
      };

      if (item.salePrice !== undefined) {
        updateFields.salePrice = Number(item.salePrice);
      }
      if (item.isOnSale !== undefined) {
        updateFields.isOnSale = Boolean(item.isOnSale);
      }

      // Check if product has sofa seating pricing
      const isSofa =
        (existing.seatPricing && Object.keys(existing.seatPricing).length > 0) ||
        /sofa/i.test(existing.name || '') ||
        /sofa/i.test(existing.category || '') ||
        (existing.tags && existing.tags.some((t: string) => /sofa/i.test(t)));

      if (isSofa) {
        const updatedSeatPricing: Record<string, number> = {};
        Object.entries(SEAT_TIERS).forEach(([key, mult]) => {
          updatedSeatPricing[key] = newPrice * mult;
        });
        updateFields.seatPricing = updatedSeatPricing;

        // Also update description if it contains "Price: Rs. xxx per seat"
        if (existing.description && /Price:\s*Rs\.?\s*\d+\s*per seat/i.test(existing.description)) {
          updateFields.description = existing.description.replace(
            /Price:\s*Rs\.?\s*\d+\s*per seat/gi,
            `Price: Rs. ${newPrice} per seat`,
          );
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: updateFields },
        },
      });
    }

    if (bulkOps.length === 0) {
      return { success: true, count: 0, matchedCount: 0, modifiedCount: 0, message: 'No valid operations' };
    }

    const result = await this.productModel.bulkWrite(bulkOps);

    return {
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} product price(s) in bulk.`,
    };
  }
}
