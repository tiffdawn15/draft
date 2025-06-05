/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Art } from '../schemas/artworks.schema';
import * as fs from 'fs/promises';

@Injectable()
export class ArtworksService {
  constructor(
    @InjectModel(Art.name)
    private readonly dataModel: Model<Art>,
  ) {}

  async importFromFile(
    filePath: string,
  ): Promise<{ success: boolean; count: number; errors?: any[] }> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jsonData = JSON.parse(fileContent);

      // Handle both single object and array of objects
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

      // Insert all records at once (batch insert)
      const result = await this.dataModel.insertMany(dataArray, {
        ordered: false, // Continue on individual errors
        rawResult: true,
      });

      return {
        success: true,
        count: result.insertedCount || dataArray.length,
      };
    } catch (error) {
      if (error.name === 'BulkWriteError') {
        // Handle partial success in bulk operations
        return {
          success: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          count: error.result.insertedCount || 0,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          errors: error.writeErrors,
        };
      }
      throw error;
    }
  }
}
