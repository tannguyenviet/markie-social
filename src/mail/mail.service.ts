import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {}

  async sendEmailConfirmation(user: { email: string }) {
    const payload = {
      email: user.email,
    };
    const secretKey = this.configService.get('MAIL_TOKEN_SECRET');
    const token = await this.tokenService.generateToken(
      payload,
      secretKey,
      '15m',
    );
    const url = `${this.configService.get(
      'BASE_API_URL',
    )}/auth/verify?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './verify', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: 'Markie',
        url,
      },
    });
  }
}
