import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordResetRequest, SignInDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    return await this.auth.signIn(body);
  }

  @Patch('first-time-password')
  async firstTimePassword(@Body() body: PasswordResetRequest) {
    return await this.auth.firstTimePassword(body);
  }
}
