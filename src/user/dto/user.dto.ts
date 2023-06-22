import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsString } from 'class-validator';
import { LOGIN_STATE } from '../user.service';
import { LoginType } from '../user.types';

export class UserResponse {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '사용자 번호',
    required: true,
  })
  userNo!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '공주',
    description: '사용할 닉네임',
  })
  nickname!: string;

  @IsNumber()
  @ApiProperty({
    example: '2',
    description: '파트너 번호',
  })
  partnerNo?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'example@kakao.com',
    description: '소셜 아이디',
  })
  socialId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Kakao',
    description: '로그인 타입 (Kakao | Apple)',
  })
  loginType!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCM Token',
    description: '파이어베이스 토큰',
  })
  firebaseToken!: string;
}

export class signUpPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'example@kakao.com',
    description: '소셜 아이디',
  })
  socialId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Kakao',
    description: '로그인 타입 (Kakao | Apple)',
  })
  loginType!: LoginType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCM Token',
    description: '파이어베이스 토큰',
  })
  firebaseToken!: string;
}

export class SignUpResult extends UserResponse {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ngI0v2YUJ9e2UPfBFjlKriIZvXvOGKfgh59hda0v....',
    description: 'Access Token',
    required: true,
  })
  accessToken!: string;
}

export class signInPayload {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '사용자 번호',
    required: true,
  })
  userNo!: number;
}

export class SignInResult extends UserResponse {
  state!: LOGIN_STATE;
}

export class UserInfoResponse {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '사용자 번호',
    required: true,
  })
  userNo!: number;

  @IsString()
  @ApiProperty({
    example: '공주',
    description: '사용할 닉네임',
  })
  nickname!: string;

  @IsNumber()
  @ApiProperty({
    example: '2',
    description: '파트너 번호',
  })
  partnerNo?: number;
}

export class SetNicknameAndPartnerPayload {
  @IsString()
  @ApiProperty({
    example: '왕자',
    description: '사용할 닉네임',
    required: true,
  })
  nickname!: string;

  @IsNumber()
  @ApiProperty({
    example: '2',
    description: '파트너 번호',
  })
  partnerNo?: number;
}
