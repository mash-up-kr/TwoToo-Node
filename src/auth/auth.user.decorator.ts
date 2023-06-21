import { createParamDecorator } from '@nestjs/common';

export const JwtParam = createParamDecorator((data, req) => {
  const request = req.switchToHttp().getRequest();
  return request.user;
});
