import { Module } from '@nestjs/common';
import { Art, ArtSchema } from './schemas/artworks.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtworksService } from './artworks/artworks.service';
import { ArtworksController } from './artworks/artworks.controller';
import { BulkJsonImportService } from 'src/bulk-json-import/bulk-json-import.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/artworks'),
    MongooseModule.forFeature([{ name: Art.name, schema: ArtSchema }]),
  ],
  controllers: [ArtworksController],
  providers: [ArtworksService, BulkJsonImportService],
})
export class ArtworksModule {}
