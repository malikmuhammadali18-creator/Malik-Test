import { Body, Controller, Get, Param, Post, Put, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BroadcastSmsDto } from './dto/broadcast-sms.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAllForUser(req.user.sub);
  }

  @Post('broadcast')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  broadcastSms(@Body() dto: BroadcastSmsDto) {
    return this.notificationsService.broadcastSms(dto.numbers, dto.message);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }
}
