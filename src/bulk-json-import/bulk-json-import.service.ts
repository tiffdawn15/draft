import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import * as fs from 'fs/promises';
import * as path from 'path';
import { Art } from 'src/artworks/schemas/artworks.schema';

export class CreateArtworkDto {
  id?: number;
  artwork_type_title?: string;
  artist_id?: number;
  image_id?: string;
  title?: string;
  api_link?: string;
  artist_display?: string;
  department_title?: string;
  publication_history?: string;
  provenance_text?: string;
  updated_at?: string;
  _sourceFile?: string;
  _importedAt?: Date;
}
export interface Artworks {
  _id?: mongoose.Schema.Types.ObjectId;
  id?: number;
  artwork_type_title?: string;
  artist_id?: number;
  image_id?: string;
  title?: string;
  api_link?: string;
  artist_display?: string;
  department_title?: string;
  publication_history?: string;
  provenance_text?: string;
  updated_at?: string;
  _sourceFile?: string;
  _importedAt?: Date;
}

@Injectable()
export class BulkJsonImportService {
  private readonly logger = new Logger(BulkJsonImportService.name);

  constructor(
    @InjectModel(Art.name)
    private readonly dataModel: Model<Art>,
  ) {}
  /**
   * Process all JSON files in a directory and import each as a separate document
   */
  async functionimportJsonFolder(
    folderPath: string,
    options?: {
      batchSize?: number;
      skipErrors?: boolean;
      filePattern?: RegExp;
      parallel?: boolean;
      maxConcurrency?: number;
    },
  ): Promise<{
    totalFiles: number;
    successful: number;
    failed: number;
    errors: Array<{ file: string; error: string }>;
  }> {
    const {
      batchSize = 100,
      skipErrors = true,
      filePattern = /\.json$/i,
    } = options || {};

    const result = {
      totalFiles: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ file: string; error: string }>,
    };

    try {
      // Get all JSON files in the directory
      const files = await this.getJsonFiles(folderPath, filePattern);
      result.totalFiles = files.length;
      this.logger.log(`Found ${files.length} JSON files to process`);

      // Process files in batches sequentially
      await this.processFilesInBatches(files, result, batchSize, skipErrors);

      this.logger.log(
        `Import completed: ${result.successful} successful, ${result.failed} failed`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to process folder: ${error}`);
      throw error;
    }
  }

  /**
   * Get all JSON files from directory
   */
  private async getJsonFiles(
    folderPath: string,
    pattern: RegExp,
  ): Promise<string[]> {
    const files = await fs.readdir(folderPath);
    return files
      .filter((file) => pattern.test(file))
      .map((file) => path.join(folderPath, file));
  }

  /**
   * Process files in batches (sequential processing)
   */
  private async processFilesInBatches(
    files: string[],
    result: any,
    batchSize: number,
    skipErrors: boolean,
  ): Promise<void> {
    const batches = this.createBatches(files, batchSize);
    this.logger.log('batches', batches);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.log(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} files)`,
      );

      const documents: CreateArtworkDto[] = [];

      for (const filePath of batch) {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const jsonData: Record<string, unknown> = JSON.parse(content);
          // Add filename and import timestamp if needed
          documents.push({
            ...jsonData,
            _sourceFile: path.basename(filePath),
            _importedAt: new Date(),
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (documents.length > 0) {
        try {
          const insertResult = await this.dataModel.insertMany(documents);
          console.log('Bulk insert result:', insertResult);

          // result.successful += documents.length;
          this.logger.log(
            `Successfully inserted ${documents.length} documents`,
          );
        } catch (error) {
          this.logger.error(error);
          if (skipErrors) {
            // Handle partial success in bulk operations
            const insertedCount = error.result?.insertedCount || 0;
            result.successful += insertedCount;
            result.failed += documents.length - insertedCount;
            this.logger.warn(
              `Batch insert partially failed: /${documents.length} succeeded`,
            );
          } else {
            throw error;
          }
        }
      }
    }
  }

  /**
   * Create batches from array
   */
  private createBatches(array: string[], batchSize: number): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      batches.push(batch);
    }
    return batches;
  }

  /**
   * Insert a single document (not used in bulk import)
   */
  async insertOne(): Promise<boolean> {
    this.logger.log('Inserting a single document for testing');
    const document: CreateArtworkDto = {
      title: 'Sample Artwork',
      artist_display: 'John Doe',
      artwork_type_title: 'Painting',
      artist_id: 123,
      image_id: 'image123',
      api_link: 'http://example.com/artwork/123',
      department_title: 'Modern Art',
      publication_history: 'Published in 2020',
      provenance_text: 'Acquired in 2021',
      updated_at: new Date().toISOString(),
      _importedAt: new Date(),
    };
    const result = await this.dataModel.create(document);
    console.log(result);
    return true;
  }

  /**
   * Preview what files would be processed (without importing)
   */
  async previewImport(folderPath: string): Promise<{
    totalFiles: number;
    sampleFiles: string[];
    estimatedSize: string;
  }> {
    const files = await this.getJsonFiles(folderPath, /\.json$/i);
    const sampleFiles = files.slice(0, 10).map((f) => path.basename(f));

    // Estimate total size
    let totalSize = 0;
    for (const file of files.slice(0, 100)) {
      // Sample first 100 files
      const stats = await fs.stat(file);
      totalSize += stats.size;
    }
    const estimatedTotalSize =
      (totalSize / Math.min(files.length, 100)) * files.length;

    return {
      totalFiles: files.length,
      sampleFiles,
      estimatedSize: this.formatBytes(estimatedTotalSize),
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
