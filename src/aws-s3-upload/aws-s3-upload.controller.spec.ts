import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3UploadController } from './aws-s3-upload.controller';

describe('AwsS3UploadController', () => {
  let controller: AwsS3UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsS3UploadController],
    }).compile();

    controller = module.get<AwsS3UploadController>(AwsS3UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
