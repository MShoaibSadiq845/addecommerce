import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

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
    return new this.productModel(dto).save();
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
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
}
