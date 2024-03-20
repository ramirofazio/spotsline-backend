import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCupon, Cupon, ChangeState } from './cupons.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CuponsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCupons(): Promise<Cupon[]> {
    return await this.prisma.cupons.findMany()
  } 

  async createCupon({ discountPercentaje, name }: CreateCupon): Promise<Cupon> {
    try {
      const cupon = await this.prisma.cupons.create({
        data: {
          name,
          discountPercentaje,
        },
      });

      HttpStatus.CREATED;
      return cupon;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changeState({ id, enabled }: ChangeState): Promise<Cupon> {
    try {
      await this.prisma.cupons.findFirstOrThrow({ where: { id } });

      const updatedCupon = await this.prisma.cupons.update({
        where: {
          id,
        },
        data: {
          enabled,
        },
      });

      HttpStatus.ACCEPTED;
      return updatedCupon;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async deleteCupon(cuponId: number): Promise<Cupon> {
    try {
      await this.prisma.cupons.findFirstOrThrow({ where: { id: cuponId } });

      const deletedCupon = await this.prisma.cupons.delete({
        where: {
          id: cuponId,
        }
      });

      HttpStatus.ACCEPTED;
      return deletedCupon;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
