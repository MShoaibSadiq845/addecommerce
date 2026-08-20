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

  // Verify Stripe Checkout Session
  @Get('verify-stripe-session')
  async verifyStripeSession(@Query('session_id') sessionId: string) {
    if (!sessionId) throw new BadRequestException('Session ID is required');
    return this.ordersService.verifyStripeSession(sessionId);
  }

  // Place a guest order (COD or Stripe)
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    console.log('📥 [OrdersController.createOrder] Received POST /orders with email:', dto?.guestEmail);
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

  // Admin: list all orders (supports status filter, excludeStatus & DB server-side search)
  @Get()
  async getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
    @Query('excludeStatus') excludeStatus?: string,
  ) {
    return this.ordersService.findAll(status, search, excludeStatus);
  }

  // Public: single order by ID
  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  // Admin: update order status (Delivered auto-sets paymentStatus to Paid)
  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
