/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Art } from '../schemas/artworks.schema';
import { ArtDto } from '../schemas/arts.dto';
import { ArtworksDto } from '../schemas/artworks.dto';

@Injectable()
export class ArtworksService {
  private readonly logger = new Logger(ArtworksService.name);

  constructor(
    @InjectModel(Art.name)
    private readonly dataModel: Model<Art>,
  ) {}

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

  async getArtworkById(id: string): Promise<ArtworksDto | null> {
    try {
      if (!id) {
        this.logger.warn('Artworks Service: Invalid ID provided');
        return null;
      }

      // Fetch the artwork by ID from the data source
      const artwork = await this.dataModel.findOne({ where: { id } });
      this.logger.debug(artwork);
      if (!artwork) {
        this.logger.warn(`Artworks Service: Artwork with ID ${id} not found`);
        return null;
      }

      // Map the artwork entity to the ArtDto (if necessary)
      const artDto: ArtworksDto = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        // Add other fields as needed
      };

      return artDto;
    } catch (error) {
      this.logger.error(
        `Artworks Service: Error fetching artwork by ID ${id}:`,
        error,
      );
      return null;
    }
  }
}
