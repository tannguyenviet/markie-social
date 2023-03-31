import * as Joi from 'joi';
export class LoginUserDto {
  email: string;
  password: string;
}

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
