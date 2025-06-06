import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { BulkJsonImportService } from 'src/bulk-json-import/bulk-json-import.service';

@Controller('artworks')
export class ArtworksController {
  private readonly logger = new Logger(ArtworksController.name);

  constructor(
    private readonly artworkService: ArtworksService,
    private bulkImportService: BulkJsonImportService,
  ) {}

  @Post('folder')
  async importFolder(
    @Body()
    body: {
      folderPath: string;
      batchSize?: number;
      skipErrors?: boolean;
      parallel?: boolean;
      maxConcurrency?: number;
    },
  ) {
    const { folderPath, ...options } = body;
    return await this.bulkImportService.importJsonFolder(folderPath, options);
  }

  @Get('preview')
  async previewImport(@Query('folderPath') folderPath: string) {
    return await this.bulkImportService.previewImport(folderPath);
  }

  // TODO: Tiff: Add Pagination
  @Get('all')
  async getAllArtworks(
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 20, // Default to 10 items per page
  ) {
    return await this.artworkService.getAllArtworks(page, limit);
  }
}
