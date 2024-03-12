import { Test, TestingModule } from '@nestjs/testing';
import { awsService } from './aws.service';

describe('awsService', () => {
  let service: awsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [awsService],
    }).compile();

    service = module.get<awsService>(awsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
