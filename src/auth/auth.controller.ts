import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  InitPasswordResetRequestDTO,
  JwtAutoSignInDTO,
  PasswordResetRequestDTO,
  SignInDto,
} from './auth.dto';
import { Public } from './publicDecorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public() //? Marcamos rutas como publicas
  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    return await this.auth.signIn(body);
  }

  @Public()
  @Post('jwt-auto-sign-in')
  async jwtAutoSignIn(@Body() body: JwtAutoSignInDTO) {
    return await this.auth.jwtAutoSignIn(body);
  }

  //? Esta ruta es privada solo con JWT en header valido ;)
  @Patch('first-time-password')
  async firstTimePassword(@Body() body: PasswordResetRequestDTO) {
    return await this.auth.firstTimePassword(body);
  }

  @Public()
  @Post('init-password-reset')
  async initPasswordReset(@Body() data: InitPasswordResetRequestDTO) {
    return await this.auth.initPasswordReset(data);
  }

  @Patch('confirm-password-reset')
  async confirmPasswordReset(@Body() data: PasswordResetRequestDTO) {
    return await this.auth.confirmPasswordReset(data);
  }
}
