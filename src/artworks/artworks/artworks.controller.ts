import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { BulkJsonImportService } from 'src/bulk-json-import/bulk-json-import.service';
import { ArtworksDto } from '../schemas/artworks.dto';
import { ResponseObject } from '../schemas/response.schema';

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
    return await this.bulkImportService.functionimportJsonFolder(
      folderPath,
      options,
    );
  }

  // @Get('all')
  // async getAllArtworks(
  //   @Query('page') page: number = 1, // Default to page 1
  //   @Query('limit') limit: number = 20, // Default to 10 items per page
  // ) {
  //   return await this.artworkService.getAllArtworks(page, limit);
  // }

  @Get('all')
  async getAllArtworks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<ResponseObject<ArtworksDto[]>> {
    try {
      const result = await this.artworkService.getAllArtworks(page, limit);
  
      return {
        status: HttpStatus.OK,
        message: 'Artworks retrieved successfully',
        data: result.data, // Extract the array of artworks
      };
    } catch (error) {
      this.logger.error('Error fetching all artworks:', error);
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  @Get(':id')
  async getArtworkById(
    @Param('id') id: string,
  ): Promise<ResponseObject<ArtworksDto> | { message: string }> {
    try {
      const artwork = await this.artworkService.getArtworkById(id);

      if (!artwork) {
        return { message: `Artwork with id ${id} not found` };
      }

      return {
        status: HttpStatus.ACCEPTED,
        data: artwork,
        message: 'Greate success!',
        error: null,
      };
    } catch (error) {
      this.logger.error(`Error fetching artwork by id ${id}:`, error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}
