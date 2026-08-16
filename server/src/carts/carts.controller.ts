import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { GetUser } from '../auth/get-user.decorator';

// Cart endpoints are admin-only for management; storefront uses Redux local state
// We keep these open for optional sync when token is present
@Controller('cart')
export class CartsController {
  constructor(
    @Inject(CartsService) private readonly cartsService: CartsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getCart(@GetUser('_id') userId: string) {
    return this.cartsService.getCart(userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async addToCart(
    @GetUser('_id') userId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartsService.addItem(userId, dto);
  }

  @Put(':itemId')
  @UseGuards(AuthGuard('jwt'))
  async updateCartItem(
    @GetUser('_id') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateItem(userId, itemId, dto);
  }

  @Delete(':itemId')
  @UseGuards(AuthGuard('jwt'))
  async removeCartItem(
    @GetUser('_id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartsService.removeItem(userId, itemId);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async clearCart(@GetUser('_id') userId: string) {
    return this.cartsService.clearCart(userId);
  }
}
