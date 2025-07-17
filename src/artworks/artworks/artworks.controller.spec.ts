/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';
import { BulkJsonImportService } from 'src/bulk-json-import/bulk-json-import.service';
import { HttpStatus } from '@nestjs/common';

const mockArtworksService = {
  delete: jest.fn(),
  getArtworksBySearch: jest.fn(),
  getArtworkById: jest.fn(),
  getAllArtworks: jest.fn(),
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

  it('should call service with correct search term', async () => {
    const search = 'pop';
    const serviceSpy = jest
      .spyOn(artworksService, 'getArtworksBySearch')
      .mockResolvedValue([]);
    await controller.getArtworkBySearch(search);
    expect(serviceSpy).toHaveBeenCalledWith(search);
  });

  it('should return data when service returns results', async () => {
    const search = 'pop';
    const mockData = [{ id: 1, title: 'Pop Art' }];
    jest
      .spyOn(artworksService, 'getArtworksBySearch')
      .mockResolvedValue(mockData);

    const result = await controller.getArtworkBySearch(search);
    expect(result).toEqual({
      status: HttpStatus.ACCEPTED,
      data: mockData,
      message: 'Greate success!',
    });
  });

  it('should return a message when no data is found', async () => {
    const search = 'unknown';
    jest.spyOn(artworksService, 'getArtworksBySearch').mockResolvedValue(null);

    const result = await controller.getArtworkBySearch(search);
    expect(result).toEqual({
      message: `Artwork with search query ${search} not found`,
    });
  });

  it('should throw an error when service throws an error', async () => {
    const search = 'error';
    jest
      .spyOn(artworksService, 'getArtworksBySearch')
      .mockRejectedValue(new Error('Service Error'));

    await expect(controller.getArtworkBySearch(search)).rejects.toThrow(
      'Internal Server Error',
    );
  });
});
