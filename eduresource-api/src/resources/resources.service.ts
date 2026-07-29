import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Resource } from '@prisma/client';

// Resource<->Tag is an explicit join table (ResourceTag) in the database;
// flatten it back into a plain `tags` array to keep the API response shape unchanged.
function flattenTags<T extends { resourceTags: { tag: unknown }[] }>(resource: T) {
  const { resourceTags, ...rest } = resource;
  return { ...rest, tags: resourceTags.map((rt) => rt.tag) };
}

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
    const resources = await this.prisma.resource.findMany({
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
        resourceTags: { include: { tag: true } },
      },
    });
    return resources.map(flattenTags);
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
        resourceTags: { include: { tag: true } },
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
    return flattenTags(resource);
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
