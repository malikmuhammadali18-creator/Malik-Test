import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Resource } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ResourceCreateInput): Promise<Resource> {
    return this.prisma.resource.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ResourceWhereUniqueInput;
    where?: Prisma.ResourceWhereInput;
    orderBy?: Prisma.ResourceOrderByWithRelationInput;
  }): Promise<Resource[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.resource.findMany({
      skip,
      take,
      cursor,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
        file: true,
        subject: true,
        grade: true,
        category: true,
        tags: true,
      },
    });
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        uploader: true,
        file: true,
        subject: true,
        grade: true,
        category: true,
        tags: true,
      },
    });
    if (!resource || resource.deletedAt) {
      throw new NotFoundException('Resource not found');
    }
    // Increment view count
    await this.prisma.resource.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    return resource;
  }

  async update(id: string, data: Prisma.ResourceUpdateInput): Promise<Resource> {
    return this.prisma.resource.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Resource> {
    // Soft delete
    return this.prisma.resource.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
