import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class ArtDTO {
  @ApiProperty({ description: 'Mongodb id' })
  _id: mongoose.Schema.Types.ObjectId;
  @ApiProperty({ description: 'Mueseum id' })
  id: number;
  @ApiProperty({ description: 'Artwork title' })
  title: string;
  @ApiProperty({ description: 'Artwork description' })
  description?: string;
  @ApiProperty({ description: 'Mueseum image id' })
  image_id?: string;
  @ApiProperty({ description: 'Artist description' })
  artist_display: string;
  @ApiProperty({ description: 'Artwork Type Title' })
  artwork_type_title?: string;
  @ApiProperty({ description: 'Artist id' })
  artist_id?: number;
  @ApiProperty({ description: 'Meuseum department title' })
  department_title?: string;
  @ApiProperty({ description: 'Publication history' })
  publication_history?: string;
  @ApiProperty({ description: 'Provenance text' })
  provenance_text?: string;
}
