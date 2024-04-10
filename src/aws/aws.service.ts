import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AwsService {
  private readonly s3Client = new S3Client({
    region: this.configService.get('AWS_S3_REGION'),
  });

  private readonly bucketUrl = env.AWS_BUCKET_BASE_URL;
  private readonly bucketName = env.AWS_BUCKET_NAME;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadProductImage(
    { originalname, buffer }: Express.Multer.File,
    variant_id: number,
  ): Promise<HttpStatus> {
    try {
      const imageUrl = `${this.bucketUrl}${originalname}`;

      const { codpro, pathfoto2 } = await this.prisma.stock.findFirst({
        where: { id: variant_id },
      });

      if (pathfoto2) {
        //? Elmino la foto vieja de AWS y sigo
        await this.deleteProductImage(pathfoto2);
      }

      const res = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: originalname,
          Body: buffer,
        }),
      );

      if (!res) {
        throw new HttpException(
          'error al cargar la imagen',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (codpro) {
        await this.prisma.stock.update({
          where: { codpro: codpro },
          data: {
            pathfoto2: imageUrl,
          },
        });
      }

      return HttpStatus.ACCEPTED;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProductImage(url: string): Promise<HttpStatus> {
    try {
      const key = url.replace(this.bucketUrl, '');
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
