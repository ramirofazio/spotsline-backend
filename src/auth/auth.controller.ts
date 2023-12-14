import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordResetRequest, SignInDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { Public } from './publicDecorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public() //? Marcamos rutas como publicas
  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    return await this.auth.signIn(body);
  }

  //? Esta ruta es privada solo con JWT en header valido ;)
  @Patch('first-time-password')
  async firstTimePassword(@Body() body: PasswordResetRequest) {
    return await this.auth.firstTimePassword(body);
  }
}
