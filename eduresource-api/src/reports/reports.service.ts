import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getResourceCount(schoolId?: string) {
    return this.prisma.resource.count({
      where: { ...(schoolId ? { schoolId } : {}), deletedAt: null },
    });
  }

  async getTotalDownloads(schoolId?: string) {
    const result = await this.prisma.resource.aggregate({
      where: { ...(schoolId ? { schoolId } : {}), deletedAt: null },
      _sum: { downloads: true },
    });
    return result._sum.downloads || 0;
  }

  async getTotalViews(schoolId?: string) {
    const result = await this.prisma.resource.aggregate({
      where: { ...(schoolId ? { schoolId } : {}), deletedAt: null },
      _sum: { views: true },
    });
    return result._sum.views || 0;
  }

  async getActiveTeachers(schoolId?: string) {
    return this.prisma.user.count({
      where: {
        role: 'Teacher',
        status: 'Active',
        ...(schoolId ? { schoolId } : {}),
      },
    });
  }

  async getRecentUploads(days = 7, schoolId?: string) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.prisma.resource.findMany({
      where: {
        createdAt: { gte: since },
        ...(schoolId ? { schoolId } : {}),
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { uploader: { select: { firstName: true, lastName: true } } },
    });
  }

  async getSchoolStatistics(schoolId: string) {
    const [resourceCount, totalDownloads, totalViews, activeTeachers, recentUploads] =
      await Promise.all([
        this.getResourceCount(schoolId),
        this.getTotalDownloads(schoolId),
        this.getTotalViews(schoolId),
        this.getActiveTeachers(schoolId),
        this.getRecentUploads(7, schoolId),
      ]);

    return {
      resourceCount,
      totalDownloads,
      totalViews,
      activeTeachers,
      recentUploads,
    };
  }

  async getSystemOverview() {
    const [totalSchools, totalUsers, totalResources, totalDownloads, totalViews] =
      await Promise.all([
        this.prisma.school.count(),
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.resource.count({ where: { deletedAt: null } }),
        this.getTotalDownloads(),
        this.getTotalViews(),
      ]);

    return { totalSchools, totalUsers, totalResources, totalDownloads, totalViews };
  }
}
