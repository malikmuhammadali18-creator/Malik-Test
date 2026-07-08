import { Controller, Get, Param, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.Admin, Role.SchoolAdmin)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    // Basic authorization: user can update themselves, or an Admin can
    if (req.user.sub !== id && req.user.role !== Role.Admin) {
      throw new Error('Unauthorized');
    }
    return this.usersService.update(id, updateData);
  }
}
