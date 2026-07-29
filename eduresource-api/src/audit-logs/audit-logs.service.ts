import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: string;
    entityId?: string;
    entityType?: string;
    details?: string;
    userId?: string;
  }) {
    return this.prisma.auditLog.create({ data: params });
  }

  async findAll(params: {
    userId?: string;
    action?: string;
    entityType?: string;
    skip?: number;
    take?: number;
  }) {
    const { userId, action, entityType, skip = 0, take = 50 } = params;
    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, skip, take };
  }
}
