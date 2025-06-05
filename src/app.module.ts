import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtworksModule } from './artworks/artworks.module';
import { BulkJsonImportService } from './bulk-json-import/bulk-json-import.service';
import { Art, ArtSchema } from './artworks/schemas/artworks.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forFeature([
      { name: Art.name, schema: ArtSchema, collection: 'artworks' },
    ]),

    ArtworksModule,
  ],
  controllers: [AppController],
  providers: [AppService, BulkJsonImportService],
})
export class AppModule {}
