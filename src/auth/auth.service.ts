import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UserRegisterDto } from './dto/UserRegisterDto';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TIME_SPAN_ACCESS_TOKEN,
  TIME_SPAN_REFRESH_TOKEN,
} from 'src/utils/constant';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(dto: UserRegisterDto) {
    // generate the password hash
    const hashPassword = await argon.hash(dto.password);
    // save the new user in the db
    try {
      const user = await this.prismaService.user.create({
        data: {
          ...dto,
          email: dto.email,
          password: hashPassword,
        },
      });

      await this.mailService.sendEmailConfirmation(user);
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    // find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.password, dto.password);

    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    const payload = { email: user.email, id: user.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: TIME_SPAN_ACCESS_TOKEN,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: TIME_SPAN_REFRESH_TOKEN,
    });

    const result = await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });
    if (!result) {
      throw new InternalServerErrorException();
    }
    return {
      accessToken,
      refreshToken,
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: ACCESS_TOKEN_SECRET,
    });

    return {
      access_token: token,
    };
  }
  checkTokenBelongSystem = async (token, secret: string) => {
    try {
      await this.jwtService.verifyAsync(token, { secret });
      return true;
    } catch (error) {
      if (error.message === 'jwt expired') {
        return true;
      }
      return false;
    }
  };
  async refreshToken(accessToken: string) {
    const isBelong = this.checkTokenBelongSystem(
      accessToken,
      ACCESS_TOKEN_SECRET,
    );
    if (!isBelong) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.decode(accessToken);
      if (typeof payload === 'string') {
        throw new UnauthorizedException();
      }
      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
        select: { email: true, id: true, refreshToken: true },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      await this.jwtService.verifyAsync(user.refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      });
      const newAccessToken = await this.jwtService.signAsync(
        { user_id: user.id, email: user.email },
        {
          secret: ACCESS_TOKEN_SECRET,
          expiresIn: TIME_SPAN_ACCESS_TOKEN,
        },
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException('session_invalid');
      }
      throw new InternalServerErrorException();
    }
  }
}
