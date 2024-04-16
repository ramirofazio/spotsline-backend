import {
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';
import { Public } from 'src/auth/publicDecorator';

@Controller('aws-s3-upload')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('productImg/:variant_id')
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
    @Param('variant_id') variant_id: number,
  ): Promise<HttpStatus> {
    return await this.awsService.uploadProductImage(file, variant_id);
  }

  @Public()
  @Post('avatar/:user_id')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Query('web_role') web_role: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 31457280 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('user_id') user_id: number,
  ): Promise<HttpStatus> {
    return await this.awsService.updateAvatar(file, user_id, web_role);
  }
}
