import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, School } from '@prisma/client';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SchoolCreateInput): Promise<School> {
    return this.prisma.school.create({ data });
  }

  async findAll(): Promise<School[]> {
    return this.prisma.school.findMany();
  }

  async findOne(id: string): Promise<School> {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    return school;
  }

  async update(id: string, data: Prisma.SchoolUpdateInput): Promise<School> {
    return this.prisma.school.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<School> {
    return this.prisma.school.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
