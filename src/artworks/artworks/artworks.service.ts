/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Art } from '../schemas/artworks.schema';
import * as fs from 'fs/promises';
import { ArtDto } from '../schemas/arts.dto';

@Injectable()
export class ArtworksService {
  private readonly logger = new Logger(ArtworksService.name);

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

  async getAllArtworks(
    page: number,
    limit: number,
  ): Promise<{
    success: boolean;
    count: number;
    data: any[];
  }> {
    try {
      const skip = (page - 1) * limit;
      const data = await this.dataModel.find({}).skip(skip).limit(limit);
      const mappedData = data
        .filter((item) => item.image_id) // Filter out items without image_id
        .map((item) => {
          const artDto = new ArtDto();
          artDto.id = item._id.toString(); // Convert ObjectId to string
          artDto.title = item.title;
          artDto.image_id = item.image_id;
          return artDto;
        });

      // Return success response with data and count
      return {
        success: true,
        count: mappedData.length,
        data: mappedData,
      };
    } catch (error) {
      // Handle errors and return failure response
      this.logger.error('Artworks Service: Error fetching artworks:', error);
      return {
        success: false,
        count: 0,
        data: [],
      };
    }
  }
}
