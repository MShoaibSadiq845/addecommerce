import { Controller, Get, Put, Body, UseGuards, Param, Query, Inject } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(search, role);
  }

  @Get('loyalty-points')
  async getLoyaltyPoints(@GetUser('_id') userId: string) {
    return this.usersService.getLoyaltyPoints(userId);
  }

  @Put('profile')
  async updateProfile(
    @GetUser('_id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
