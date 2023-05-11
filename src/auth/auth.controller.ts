import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { JoiValidationPipe } from 'src/utils/validation';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { LoginUserDto, loginUserSchema } from './dto/UserLoginDto';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { refreshTokenSchema } from './dto/refreshTokenDto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  // @UsePipes()
  async signup(@Body() dto: UserRegisterDto, @Res() res) {
    const data = await this.authService.signup(dto);
    return res.status(200).send(data);
  }

  // @UseFilters(new HttpExceptionFilter())
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new JoiValidationPipe(loginUserSchema))
  async login(@Body() dto: LoginUserDto, @Res() res) {
    const accessToken = await this.authService.login(dto);
    return res.status(200).send(accessToken);
  }
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @UsePipes(new JoiValidationPipe(refreshTokenSchema))
  async refreshToken(@Body() body: { accessToken: string }, @Res() res) {
    const newAccessToken = await this.authService.refreshToken(
      body.accessToken,
    );
    return res.send(newAccessToken);
  }
}
