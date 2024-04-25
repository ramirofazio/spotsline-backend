import { Test, TestingModule } from '@nestjs/testing';
import { CurrentAccountService } from './current-account.service';

describe('CurrentAccountService', () => {
  let service: CurrentAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrentAccountService],
    }).compile();

    service = module.get<CurrentAccountService>(CurrentAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
