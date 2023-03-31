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
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/token/token.service';
import { MailService } from 'src/mail/mail.service';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
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
    console.log('herreee');

    const secretKey = this.configService.get('JWT_SECRET');
    const refreshSecretKey = this.configService.get('JWT_REFRESH');
    const accessToken = await this.tokenService.generateToken(
      payload,
      secretKey,
      '30s',
    );
    const refreshToken = await this.tokenService.generateToken(
      payload,
      refreshSecretKey,
      '2m',
    );

    console.log(refreshToken);
    const result = await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });
    if (!result) {
      throw new InternalServerErrorException();
    }
    console.log('result', result);
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
    const secret = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async refreshToken(accessToken: string) {
    const refreshSecretKey = this.configService.get('JWT_REFRESH') as string;
    const accessTokenSecret = this.configService.get('JWT_SECRET');
    console.log('zoos');
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: accessTokenSecret,
      });
      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
        select: { email: true, id: true, refreshToken: true },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      const payloadRefreshToken = await this.jwtService.verifyAsync(
        user.refreshToken,
        {
          secret: accessTokenSecret,
        },
      );

      const newAccessToken = await this.jwtService.signAsync(
        payloadRefreshToken,
        {
          secret: accessTokenSecret,
        },
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      console.log(error.message);
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException('jwt expired');
      }
      throw new InternalServerErrorException();
    }
  }
}
