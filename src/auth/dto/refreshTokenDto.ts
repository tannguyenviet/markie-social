import * as Joi from 'joi';

export class RefreshTokenDto {
  refreshToken: string;
}
export const refreshTokenSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
