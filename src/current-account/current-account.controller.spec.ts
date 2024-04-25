import { Test, TestingModule } from '@nestjs/testing';
import { CurrentAccountController } from './current-account.controller';

describe('CurrentAccountController', () => {
  let controller: CurrentAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentAccountController],
    }).compile();

    controller = module.get<CurrentAccountController>(CurrentAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
