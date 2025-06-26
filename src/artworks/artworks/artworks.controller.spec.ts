/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';
import { BulkJsonImportService } from 'src/bulk-json-import/bulk-json-import.service';

const mockArtworksService = {
  delete: jest.fn(),
};

const mockBulkJsonImportService = {
  // Mock any methods used in the controller
  importJson: jest.fn(),
};

describe('ArtworksController', () => {
  let controller: ArtworksController;
  let artworksService: ArtworksService;
  let bulkJsonImportService: BulkJsonImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtworksController],
      providers: [
        {
          provide: ArtworksService,
          useValue: mockArtworksService,
        },
        {
          provide: BulkJsonImportService,
          useValue: mockBulkJsonImportService,
        },
      ],
    }).compile();

    controller = module.get<ArtworksController>(ArtworksController);
    artworksService = module.get<ArtworksService>(ArtworksService);
    bulkJsonImportService = module.get<BulkJsonImportService>(
      BulkJsonImportService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
