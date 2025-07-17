/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('artworks')
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

  @Get('all')
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'The artworks have been delivered. :)',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getAllArtworks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<ResponseObject<ArtworksDto[]>> {
    try {
      const result = await this.artworkService.getAllArtworks(page, limit);

      return {
        pagination: result.pagination,
        status: HttpStatus.OK,
        message: 'Artworks retrieved successfully',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error fetching all artworks:', error);
      throw new InternalServerErrorException({
        status: 'error',
        message: error.toString() || 'Internal Server Error',
      });
    }
  }

  @Get('search')
  @ApiQuery({
    name: 'term',
    required: true,
    description: 'String term for artworks',
  })
  @ApiResponse({
    status: 200,
    description: 'The artworks have been delivered. :)',
    type: [ArtworksDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getArtworkBySearch(
    @Query('search') search: string,
  ): Promise<ResponseObject<ArtworksDto[]> | { message: string }> {
    try {
      const artwork = await this.artworkService.getArtworksBySearch(search);
      if (!artwork) {
        return { message: `Artwork with search query ${search} not found` };
      }

      return {
        status: HttpStatus.ACCEPTED,
        data: artwork,
        message: 'Greate success!',
      };
    } catch (error) {
      this.logger.error(`Error fetching artwork by id ${search}:`, error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  @Get(':id')
  @ApiQuery({ name: 'id', required: false, description: 'Artwork id' })
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
      };
    } catch (error) {
      this.logger.error(`Error fetching artwork by id ${id}:`, error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
}
