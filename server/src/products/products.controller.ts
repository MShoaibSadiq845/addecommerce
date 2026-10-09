import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkUploadProductDto } from './dto/bulk-upload-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// No authentication on any route — fully public API
@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService) private readonly productsService: ProductsService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(CloudinaryService) private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('Upload endpoint hit');
    console.log('File received:', file ? 'Yes' : 'No');
    
    if (!file) {
      console.error('No file in request');
      throw new Error('No file uploaded');
    }
    
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
    });

    try {
      console.log('Calling cloudinary upload...');
      const result = await this.cloudinaryService.uploadFile(file);
      console.log('Upload successful:', result.secure_url);
      return { url: result.secure_url };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // ── Bulk Upload: POST /products/bulk-upload ──────────────────────────────
  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];
    if (!allowedMimes.includes(file.mimetype) && !file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      throw new BadRequestException('Only CSV or Excel files are allowed');
    }

    let rows: Record<string, unknown>[];
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } catch {
      throw new BadRequestException('Could not parse file — make sure it is a valid CSV or Excel file');
    }

    if (!rows.length) throw new BadRequestException('File is empty or has no data rows');

    // Map spreadsheet columns → DTO
    const dtos: BulkUploadProductDto[] = rows.map((r) => ({
      name: String(r['productName'] ?? r['name'] ?? '').trim(),
      description: String(r['description'] ?? '').trim(),
      price: Number(r['price'] ?? 0),
      category: String(r['category'] ?? '').trim(),
      stock: Number(r['stockQuantity'] ?? r['stock'] ?? 0),
      sku: String(r['skuCode'] ?? r['sku'] ?? '').trim(),
      colors: String(r['colors'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      sizes: String(r['sizes'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      images: String(r['imageUrls'] ?? r['images'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      brand: String(r['brand'] ?? 'Fab Decor').trim(),
      rating: Number(r['rating'] ?? 4.5),
    }));

    return this.productsService.bulkUploadProducts(dtos);
  }

  @Get()
  async getAll(@Query() query: ProductQuery) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('filter-options')
  async getFilterOptions() {
    return this.productsService.getFilterOptions();
  }

  @Get('low-stock')
  async getLowStock() {
    return this.productsService.getLowStockProducts();
  }

  @Put('bulk-prices')
  async bulkUpdatePricesPut(@Body() body: any) {
    const items = Array.isArray(body) ? body : body?.items || [];
    return this.productsService.bulkUpdatePrices(items);
  }

  @Post('bulk-prices')
  async bulkUpdatePricesPost(@Body() body: any) {
    const items = Array.isArray(body) ? body : body?.items || [];
    return this.productsService.bulkUpdatePrices(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id')
  async updatePatch(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Put(':id/sale')
  async toggleSale(
    @Param('id') id: string,
    @Body() body: { isOnSale: boolean; salePrice?: number },
  ) {
    const product = await this.productsService.toggleSale(id, body.isOnSale, body.salePrice);
    if (body.isOnSale) {
      await this.notificationsService.createAndBroadcast({
        title: '🔥 Flash Sale Alert!',
        message: `${product.name} is now on sale for ₨${product.salePrice || product.price}!`,
        type: 'sale',
        link: `/shop/${product._id}`,
      });
    }
    return product;
  }
}