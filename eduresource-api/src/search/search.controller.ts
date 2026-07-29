import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ResourceType } from '@prisma/client';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') keyword?: string,
    @Query('subjectId') subjectId?: string,
    @Query('gradeId') gradeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('resourceType') resourceType?: ResourceType,
    @Query('tags') tags?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'downloads' | 'views' | 'title',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.searchService.search({
      keyword,
      subjectId,
      gradeId,
      categoryId,
      resourceType,
      tags: tags ? tags.split(',') : undefined,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
    });
  }
}
