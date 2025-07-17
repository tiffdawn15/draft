/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArtDocument } from '../schemas/artworks.schema';
import { ArtDTO } from '../schemas/arts.dto';
import { ArtworksDto } from '../schemas/artworks.dto';

export interface Pagination {
  page?: number;
  limit?: number;
  total?: number;
}

@Injectable()
export class ArtworksService {
  private readonly logger = new Logger(ArtworksService.name);

  constructor(
    @InjectModel('Art')
    private readonly dataModel: Model<ArtDocument>,
  ) {}

  async getAllArtworks(
    page: number,
    limit: number,
  ): Promise<{
    pagination: Pagination;
    success: boolean;
    total: number;
    data: ArtDTO[];
  }> {
    try {
      const skip = (page - 1) * limit;
      const total = await this.dataModel.countDocuments({});

      const data: ArtDocument[] = await this.dataModel
        .find({})
        .skip(skip)
        .limit(limit);

      const mappedData = data
        .filter((item) => item.image_id)
        .map((item) => {
          const artDto = new ArtDTO();
          // artDto._id = item._id;
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

      return {
        pagination: {
          total: total,
          page: page,
          limit: limit,
        },
        success: true,
        total: mappedData.length,
        data: mappedData,
      };
    } catch (error) {
      this.logger.error('Artworks Service: Error fetching artworks:', error);
      return {
        pagination: {
          total: 0,
        },
        success: false,
        total: 0,
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
      const artwork = await this.dataModel.findOne({ id: id });
      this.logger.debug('artwork', artwork);
      if (!artwork) {
        this.logger.error(`Artworks Service: Artwork with id ${id} not found`);
        return null;
      }

      // Map the artwork entity to the ArtDto (if necessary)
      const artDto: ArtworksDto = {
        // _id: artwork._id,
        id: artwork.id || 0,
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

  async getArtworksBySearch(search: string): Promise<ArtworksDto[] | null> {
    try {
      if (!search) {
        this.logger.warn('No query for search');
        return null;
      }

      const query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { artist_display: { $regex: search, $options: 'i' } },
          { artwork_type_title: { $regex: search, $options: 'i' } },
        ],
      };

      // Fetch the artwork by ID from the data source
      const results = await this.dataModel.find(query).exec();
      this.logger.debug('artwork', results);
      if (!results) {
        this.logger.error(
          `Artworks Service: Artworks for this ${search} not found`,
        );
        return null;
      }

      return results.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        image_id: artwork.image_id,
        artist_display: artwork.artist_display,
        artwork_type_title: artwork.artwork_type_title,
        artist_id: artwork.artist_id,
      }));
    } catch (error) {
      this.logger.error(
        `Artworks Service: Error fetching artwork by term: ${search}:`,
        error,
      );
      return null;
    }
  }
}
