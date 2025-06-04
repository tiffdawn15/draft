import { Module } from '@nestjs/common';
import { Art, ArtSchema } from './schemas/artworks.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtworksService } from './artworks/artworks.service';
import { ArtworksController } from './artworks/artworks.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Art.name, schema: ArtSchema }])],
  controllers: [ArtworksController],
  providers: [ArtworksService],
})
export class ArtworksModule {}
