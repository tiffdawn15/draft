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

  @Post('file')
  async importFromFile() {
    this.logger.debug('importFromFile method invoked');
    const filePath = 'src/data/allArtworks.jsonl';
    this.logger.debug(`File path: ${filePath}`);

    try {
      const result = await this.artworkService.importFromFile(filePath);
      this.logger.debug('Service call completed successfully');
      return {
        message: 'Import completed',
        ...result,
      };
    } catch (error) {
      this.logger.error('Error occurred during import', error);
      throw error; // Re-throw the error to ensure proper error handling
    }
  }

  @Get('hello')
  hello() {
    this.logger.debug('hello method invoked');
    return 'Hello, World!';
  }

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
}
