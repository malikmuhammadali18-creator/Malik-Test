import { Controller, Get, UseGuards } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('subjects')
  findSubjects() {
    return this.taxonomyService.findSubjects();
  }

  @Get('grades')
  findGrades() {
    return this.taxonomyService.findGrades();
  }

  @Get('categories')
  findCategories() {
    return this.taxonomyService.findCategories();
  }

  @Get('tags')
  findTags() {
    return this.taxonomyService.findTags();
  }
}
