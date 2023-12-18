import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { env } from 'process';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);
@Injectable()
export class MailsService {
  async test(
    email: string,
    temporal_access_token: string,
  ): Promise<HttpStatus> {
    try {
      const data = await resend.emails.send({
        from: 'SPOTSLINE <spotsline@resend.dev>',
        to: [email],
        subject: 'Actualiza tu contraseña',
        html: `<a href="http://localhost:5173?reset=true&&access_token=${temporal_access_token}">Link</a>`,
      });

      if (!data.error) {
        return HttpStatus.OK;
      }

      console.log(data);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
