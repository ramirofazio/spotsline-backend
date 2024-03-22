import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class awsService {
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
    product_id: number,
  ): Promise<HttpStatus> {
    try {
      const exist = await this.checkImageExists(originalname);

      if (exist) {
        return HttpStatus.ACCEPTED;
      }

      const res = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: originalname,
          Body: buffer,
        }),
      );

      if (!res) {
        //TODO PROBAR ESTO WARNING
        throw new HttpException(
          'error al cargar la imagen',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const imageUrl = `${this.bucketUrl}${originalname}`;

      //? Busco el producto y le enlazo la imagen guardada
      const { codpro, pathfoto2 } = await this.prisma.stock.findFirst({
        where: { id: product_id },
      });

      if (codpro) {
        await this.prisma.stock.update({
          where: { codpro: codpro },
          //? Guardo un string con todos los url de las imagenes. En FE usar !pathfoto2.split("-").map((img) => img === fotoProd)
          data: {
            pathfoto2: pathfoto2 ? `${pathfoto2} - ${imageUrl}` : imageUrl,
          },
        });
      }

      return HttpStatus.ACCEPTED;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProductImage(product_id: number): Promise<HttpStatus> {
    try {
      const product = await this.prisma.stock.findFirst({
        where: { id: product_id },
      });

      if (!product) {
        throw new HttpException('producto no encontrado', HttpStatus.NOT_FOUND);
      }

      if (product.pathfoto2) {
        const key = product.pathfoto2.replace(this.bucketUrl, '');
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
        );
      }

      await this.prisma.stock.update({
        where: { codpro: product.codpro },
        data: { pathfoto2: '' },
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkImageExists(key: string): Promise<boolean> {
    try {
      //? Valido si la imagen existe en el bucket para no duplicarla
      await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
