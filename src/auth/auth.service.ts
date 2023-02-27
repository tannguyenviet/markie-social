import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/token/token.service';
import { MailService } from 'src/mail/mail.service';
import { UserRegisterDto } from './dto/UserRegisterDto';

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
    console.log({ dto });
    try {
      const user = await this.prismaService.user.create({
        data: {
          ...dto,
          email: dto.email,
          password: hashPassword,
        },
      });

      return this.mailService.sendEmailConfirmation(user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    console.log({ user });

    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.password, dto.password);
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    const payload = { email: user.email, id: user.id };
    const secretKey = this.configService.get('JWT_SECRET');
    return this.tokenService.generateToken(payload, secretKey);
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
}
