import { Test, TestingModule } from '@nestjs/testing';
import { TestDbCloudService } from './test-db-cloud.service';

describe('TestDbCloudService', () => {
  let service: TestDbCloudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestDbCloudService],
    }).compile();

    service = module.get<TestDbCloudService>(TestDbCloudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
