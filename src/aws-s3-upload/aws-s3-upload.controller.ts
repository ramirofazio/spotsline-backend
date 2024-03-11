import {
  Controller,
  Delete,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/publicDecorator';
import { AwsS3UploadService } from './aws-s3-upload.service';

@Controller('aws-s3-upload')
export class AwsS3UploadController {
  constructor(private readonly uploadService: AwsS3UploadService) {}

  @Post('/:product_id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadproductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 31457280 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('product_id') product_id: number,
  ): Promise<HttpStatus> {
    return await this.uploadService.uploadProductImage(file, product_id);
  }

  @Delete(':product_id')
  async deleteProductImage(
    @Param('product_id') product_id: number,
  ): Promise<HttpStatus> {
    return await this.uploadService.deleteProductImage(product_id);
  }
}
