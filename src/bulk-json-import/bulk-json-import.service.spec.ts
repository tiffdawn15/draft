import { Test, TestingModule } from '@nestjs/testing';
import { BulkJsonImportService } from './bulk-json-import.service';

describe('BulkJsonImportService', () => {
  let service: BulkJsonImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BulkJsonImportService],
    }).compile();

    service = module.get<BulkJsonImportService>(BulkJsonImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
