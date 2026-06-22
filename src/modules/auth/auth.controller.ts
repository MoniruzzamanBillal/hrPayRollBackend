import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //

  // ! for login
  @Post('login')
  async loginUser(@Body() payload: LoginDto) {
    const result = await this.authService.loginUser(payload);

    return {
      result,
      message: 'User logged in successfully!!!',
    };
  }

  //
}
