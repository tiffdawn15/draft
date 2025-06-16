import { Test, TestingModule } from '@nestjs/testing';
import { BulkJsonImportService } from './bulk-json-import.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Art } from '../artworks/schemas/artworks.schema'; // Ensure the correct path to the Art schema

const mockArtModelImplementation = {
  find: jest.fn(), // Mock any methods you use in your service
  create: jest.fn(),
};

describe('BulkJsonImportService', () => {
  let service: BulkJsonImportService;
  let model: Model<Art>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkJsonImportService,
        {
          provide: getModelToken(Art.name),
          useValue: mockArtModelImplementation, // Provide the mocked implementation
        },
      ],
    }).compile();

    service = module.get<BulkJsonImportService>(BulkJsonImportService);
    model = module.get<Model<Art>>(getModelToken(Art.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the model find method', async () => {
    await model.find();
    expect(mockArtModelImplementation.find).toHaveBeenCalled();
  });
});
