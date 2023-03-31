import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  // @IsNotEmpty()
  email: string;

  @IsString()
  // @IsNotEmpty()
  password: string;

  @IsString()
  firstName?: string;
  @IsString()
  lastName?: string;
}
