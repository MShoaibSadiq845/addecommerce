import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { GuestCartsService } from './guest-carts.service';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';

/** Public cart endpoints — no authentication required.
 *  The client generates a UUID (sessionId) stored in localStorage
 *  and passes it with every request. */
@Controller('guest-cart')
export class GuestCartsController {
  constructor(
    @Inject(GuestCartsService)
    private readonly guestCartsService: GuestCartsService,
  ) {}

  /** GET /guest-cart?sessionId=<uuid> */
  @Get()
  async getCart(@Query('sessionId') sessionId: string) {
    if (!sessionId) throw new BadRequestException('sessionId is required');
    return this.guestCartsService.getCart(sessionId);
  }

  /** POST /guest-cart  — body includes sessionId + item fields */
  @Post()
  async addItem(@Body() dto: GuestAddCartItemDto) {
    return this.guestCartsService.addItem(dto);
  }

  /** DELETE /guest-cart/:itemId?sessionId=<uuid> */
  @Delete(':itemId')
  async removeItem(
    @Param('itemId') itemId: string,
    @Query('sessionId') sessionId: string,
  ) {
    if (!sessionId) throw new BadRequestException('sessionId is required');
    return this.guestCartsService.removeItem(sessionId, itemId);
  }

  /** DELETE /guest-cart?sessionId=<uuid>  — clears whole cart */
  @Delete()
  async clearCart(@Query('sessionId') sessionId: string) {
    if (!sessionId) throw new BadRequestException('sessionId is required');
    return this.guestCartsService.clearCart(sessionId);
  }
}
