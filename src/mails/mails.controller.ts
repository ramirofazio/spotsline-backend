import {
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MailsService } from './mails.service';
import { RrhhBody } from './mails.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('mailing')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Public()
  @Post('/rrhh')
  @UseInterceptors(FileInterceptor('file'))
  async uploadproductImage(
    @Body() emailData: RrhhBody,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 40 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(pdf|msword|zip)' }),
        ],
      }),
    )
    file?: Express.Multer.File | null,
  ): Promise<HttpStatus> {
    return await this.mailsService.sendRrhhContact({ emailData, file });
  }
}
