import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Grade, Subject, Tag } from '@prisma/client';

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  async findSubjects(): Promise<Subject[]> {
    return this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async findGrades(): Promise<Grade[]> {
    return this.prisma.grade.findMany({ orderBy: { name: 'asc' } });
  }

  async findCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }
}
