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
          // Use the syntax to unpack the object
          console.log(item);
          const artDto = new ArtDto();
          artDto.id = item.id;
          artDto.title = item.title;
          artDto.image_id = item.image_id;
          artDto.artist_display = item.artist_display || '';
          artDto.artwork_type_title = item.artwork_type_title || '';
          artDto.artist_id = item.artist_id || 0;
          artDto.department_title = item.department_title || '';
          artDto.publication_history = item.publication_history || '';
          artDto.provenance_text = item.provenance_text || '';
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
      const artwork = await this.dataModel.findOne({id: id});
      this.logger.debug('artwork', artwork);
      if (!artwork) {
        this.logger.error(`Artworks Service: Artwork with id ${id} not found`);
        return null;
      }

      // Map the artwork entity to the ArtDto (if necessary)
      const artDto: ArtworksDto = {
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        api_link: artwork.api_link,
        image_id: artwork.image_id,
        artist_display: artwork.artist_display || '',
        artwork_type_title: artwork.artwork_type_title || '',
        artist_id: artwork.artist_id || 0,
        
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
