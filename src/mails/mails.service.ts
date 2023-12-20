import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { env } from 'process';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);
@Injectable()
export class MailsService {
  async sendInitPasswordReset(
    email: string,
    temporal_access_token: string,
  ): Promise<HttpStatus> {
    try {
      const data = await resend.emails.send({
        from: 'SPOTSLINE <spotsline@resend.dev>',
        to: [email],
        subject: 'Actualiza tu contraseña',
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
 <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <style>
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 400;
        mso-font-alt: "sans-serif";
        src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format("woff2");
      }

      * {
        font-family: "Inter", sans-serif;
      }
    </style>
    <style>
      blockquote,
      h1,
      h2,
      h3,
      img,
      li,
      ol,
      p,
      ul {
        margin-top: 0;
        margin-bottom: 0;
      }
    </style>
  </head>
  <body>
    <div
      style="display: none; overflow: hidden; line-height: 1px; opacity: 0; max-height: 0; max-width: 0"
      id="__react-email-preview"
    >
      ACTUALIZA TU CONTRASEÑA
      <div>
         ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿
      </div>
    </div>
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width: 600px; min-width: 300px; width: 100%; margin-left: auto; margin-right: auto; padding: 0.5rem"
    >
      <tbody>
        <tr style="width: 100%">
          <td>
            <h2
              style="
                text-align: center;
                color: rgb(17, 24, 39);
                margin-bottom: 12px;
                margin-top: 0px;
                font-size: 30px;
                line-height: 36px;
                font-weight: 700;
              "
            >
              <strong>Actualiza Tu Contraseña</strong>
            </h2>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: left;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
              ¡Hola!
            </p>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: left;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
              Hemos recibido una solicitud para actualizar la contraseña asociada a tu cuenta. Si fuiste tú quien
              solicitó esto, simplemente haz clic en el botón de abajo para proceder:
            </p>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width: 100%; text-align: center; margin-bottom: 0px"
            >
              <tbody>
                <tr style="width: 100%">
                  <td>
                    <a
                      href="http://localhost:5173?reset=true&amp;&amp;access_token=${temporal_access_token}"
                      style="
                        color: #000000;
                        background-color: #f9ce41;
                        border-color: #f9ce41;
                        padding: 12px 34px 12px 34px;
                        border-width: 2px;
                        border-style: solid;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 500;
                        border-radius: 450px;
                        line-height: 100%;
                        display: inline-block;
                        max-width: 100%;
                      "
                      target="_blank"
                      ><span
                        ><!--[if mso
                          ]><i style="letter-spacing: 34px; mso-font-width: -100%; mso-text-raise: 18" hidden
                            >&nbsp;</i
                          ><!
                        [endif]--></span
                      ><span
                        style="
                          max-width: 100%;
                          display: inline-block;
                          line-height: 120%;
                          mso-padding-alt: 0px;
                          mso-text-raise: 9px;
                        "
                        >RESTABLECER CONTRASEÑA →</span
                      ><span
                        ><!--[if mso
                          ]><i style="letter-spacing: 34px; mso-font-width: -100%" hidden>&nbsp;</i><!
                        [endif]--></span
                      ></a
                    >
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width: 37.5em; height: 8px"
            >
              <tbody>
                <tr style="width: 100%">
                  <td></td>
                </tr>
              </tbody>
            </table>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: left;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
               
            </p>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: left;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
              Este enlace es válido por <strong>2 horas</strong> desde el momento en que se envió este correo
              electrónico.
            </p>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: start;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
              Si no solicitaste cambiar tu contraseña, ignora este correo electrónico o contáctanos para asegurar tu
              cuenta.
            </p>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: start;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
              Este es un correo electrónico <strong>automático</strong>; por favor, no respondas a este mensaje.
            </p>
            <p
              style="
                font-size: 15px;
                line-height: 24px;
                margin: 16px 0;
                text-align: left;
                margin-bottom: 20px;
                margin-top: 0px;
                color: rgb(55, 65, 81);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              "
            >
              Saludos cordiales,<br />El equipo de <strong>Spotsline</strong>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`,
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
