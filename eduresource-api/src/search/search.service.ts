import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ResourceType, Visibility } from '@prisma/client';

export interface SearchParams {
  keyword?: string;
  subjectId?: string;
  gradeId?: string;
  categoryId?: string;
  resourceType?: ResourceType;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'downloads' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(params: SearchParams) {
    const {
      keyword,
      subjectId,
      gradeId,
      categoryId,
      resourceType,
      tags,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      skip = 0,
      take = 20,
    } = params;

    const where: Prisma.ResourceWhereInput = {
      deletedAt: null,
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (subjectId) where.subjectId = subjectId;
    if (gradeId) where.gradeId = gradeId;
    if (categoryId) where.categoryId = categoryId;
    if (resourceType) where.resourceType = resourceType;

    if (tags && tags.length > 0) {
      where.resourceTags = { some: { tag: { name: { in: tags } } } };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orderBy: Prisma.ResourceOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [rawData, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          subject: true,
          grade: true,
          category: true,
          resourceTags: { include: { tag: true } },
          uploader: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.resource.count({ where }),
    ]);

    const data = rawData.map(({ resourceTags, ...resource }) => ({
      ...resource,
      tags: resourceTags.map((rt) => rt.tag),
    }));

    return {
      data,
      total,
      skip,
      take,
      pages: Math.ceil(total / take),
    };
  }
}
