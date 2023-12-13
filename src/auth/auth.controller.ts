import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signInDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() body: signInDto) {
    return await this.auth.signIn(body);
  }
}
