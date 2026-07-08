import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.Admin)
  @Get('overview')
  getSystemOverview() {
    return this.reportsService.getSystemOverview();
  }

  @Roles(Role.Admin, Role.SchoolAdmin)
  @Get('schools/:id')
  getSchoolStats(@Param('id') id: string) {
    return this.reportsService.getSchoolStatistics(id);
  }

  @Roles(Role.Admin, Role.SchoolAdmin)
  @Get('recent-uploads')
  getRecentUploads(@Query('days') days?: string, @Query('schoolId') schoolId?: string) {
    return this.reportsService.getRecentUploads(days ? parseInt(days) : 7, schoolId);
  }
}
