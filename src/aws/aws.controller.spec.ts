import { Test, TestingModule } from '@nestjs/testing';
import { awsController } from './aws.controller';

describe('awsController', () => {
  let controller: awsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [awsController],
    }).compile();

    controller = module.get<awsController>(awsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
