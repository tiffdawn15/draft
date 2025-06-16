import { Test, TestingModule } from '@nestjs/testing';
import { ArtworksService } from './artworks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Art } from '../schemas/artworks.schema'; // Ensure the correct path to the Art schema

const mockArtModel = {
  find: jest.fn(), // Mock any methods used in ArtworksService
  create: jest.fn(),
  findById: jest.fn(),
};

describe('ArtworksService', () => {
  let service: ArtworksService;
  let model: Model<Art>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtworksService,
        {
          provide: getModelToken(Art.name), // Ensure this matches the schema name
          useValue: mockArtModel, // Provide the mocked model
        },
      ],
    }).compile();

    service = module.get<ArtworksService>(ArtworksService);
    model = module.get<Model<Art>>(getModelToken(Art.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the model find method', async () => {
    await model.find();
    expect(mockArtModel.find).toHaveBeenCalled();
  });
});
