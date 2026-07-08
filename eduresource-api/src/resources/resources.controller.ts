import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile, Req, Query } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { StorageService } from '../storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly storageService: StorageService
  ) {}

  @Roles(Role.Admin, Role.SchoolAdmin, Role.Teacher)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createResourceDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    let fileMetadata = null;
    if (file) {
      const { key, url } = await this.storageService.uploadFile(file);
      fileMetadata = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        storageKey: key,
      };
    }

    const resourceData = {
      ...createResourceDto,
      uploadedBy: req.user.sub,
      schoolId: req.user.schoolId,
    };

    if (fileMetadata) {
      resourceData.file = { create: fileMetadata };
    }

    return this.resourcesService.create(resourceData);
  }

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.resourcesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Roles(Role.Admin, Role.SchoolAdmin, Role.Teacher)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateResourceDto: any) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Roles(Role.Admin, Role.SchoolAdmin, Role.Teacher)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
