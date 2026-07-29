import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Grade, Subject, Tag } from '@prisma/client';

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  async findSubjects(): Promise<Subject[]> {
    return this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  private readonly defaultGrades = [
    'Play Group',
    'Nursery',
    'Prep',
    'Two',
    'Three',
    'Four',
    '6th',
    '7th',
    'Pre 9th',
    '9th',
    'Grade 1',
    'Grade 5',
    'Grade 10',
  ];

  async findGrades(): Promise<Grade[]> {
    for (const name of this.defaultGrades) {
      await this.prisma.grade.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    return this.prisma.grade.findMany({ orderBy: { name: 'asc' } });
  }

  async findCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }
}
