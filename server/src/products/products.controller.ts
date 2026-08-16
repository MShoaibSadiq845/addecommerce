import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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