import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './schemas/order.schema';

// No authentication on any route — fully public API
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  // Validate cart & stock before checkout
  @Post('validate-checkout')
  async validateCheckout(
    @Body() dto: { items: Array<{ productId: string; quantity: number; name?: string }> },
  ) {
    return this.ordersService.validateCheckout(dto);
  }

  // Place a guest order
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // Track orders by email
  @Get('by-email')
  async getOrdersByEmail(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.ordersService.findByGuestEmail(email);
  }

  // Admin dashboard metrics
  @Get('metrics')
  async getAdminMetrics() {
    return this.ordersService.getAdminMetrics();
  }

  // Admin: list all orders
  @Get()
  async getAllOrders(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  // Public: single order by ID
  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  // Admin: update order status
  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
