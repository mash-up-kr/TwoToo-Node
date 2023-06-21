import { LoginType } from '../user/user.types';

export type JwtPayload = { userNo: number; socialId: string; loginType: LoginType };
