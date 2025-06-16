import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { BulkJsonImportService } from 'src/bulk-json-import/bulk-json-import.service';
import { ArtworksDto } from '../schemas/artworks.dto';

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

  @Get('all')
  async getAllArtworks(
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 20, // Default to 10 items per page
  ) {
    return await this.artworkService.getAllArtworks(page, limit);
  }

  @Get(':id')
  async getArtworkById(
    @Param('id') id: string,
  ): Promise<ArtworksDto | { message: string }> {
    try {
      const artwork = await this.artworkService.getArtworkById(id);

      if (!artwork) {
        return { message: `Artwork with ID ${id} not found` }; // NestJS will handle the response
      }

      return artwork;
    } catch (error) {
      this.logger.error(`Error fetching artwork by ID ${id}:`, error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
