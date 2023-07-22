import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';
import { LOGIN_STATE } from '../user.service';
import { LoginType } from '../user.types';

export class UserResDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '사용자 번호',
    required: true,
  })
  userNo!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '공주',
    description: '사용할 닉네임',
    required: true,
  })
  nickname!: string;

  @IsNumber()
  @ApiPropertyOptional({
    example: 2,
    description: '파트너 번호',
  })
  partnerNo?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'example@kakao.com',
    description: '소셜 아이디',
    required: true,
  })
  socialId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Kakao',
    description: '로그인 타입 (Kakao | Apple)',
    required: true,
  })
  loginType!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCM Token',
    description: '파이어베이스 토큰',
    required: true,
  })
  deviceToken!: string;
}

export class AuhtorizationPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'example@kakao.com',
    description: '소셜 아이디',
    required: true,
  })
  socialId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Kakao',
    description: '로그인 타입 (Kakao | Apple)',
    required: true,
  })
  loginType!: LoginType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCM Token',
    description: '파이어베이스 토큰',
    required: true,
  })
  deviceToken!: string;
}

export class AuthorizationResDto extends UserResDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '로그인 상태',
    enum: LOGIN_STATE,
    required: true,
  })
  state!: LOGIN_STATE;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ngI0v2YUJ9e2UPfBFjlKriIZvXvOGKfgh59hda0v....',
    description: 'Access Token',
    required: true,
  })
  accessToken!: string;
}

export class UserInfoResDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '사용자 번호',
    required: true,
  })
  userNo!: number;

  @IsString()
  @ApiProperty({
    example: '공주',
    description: '닉네임',
    required: true,
  })
  nickname!: string;

  @IsNumber()
  @ApiPropertyOptional({
    example: 2,
    description: '파트너 번호',
  })
  partnerNo?: number;
}

export class GetMyInfoResDto extends UserInfoResDto {
  @IsString()
  @ApiProperty({
    example: '왕자',
    description: '파트너 닉네임',
    required: true,
  })
  partnerNickname!: string | null;

  @IsNumber()
  @ApiProperty({
    example: 3,
    description: '현재까지 진행중인 챌린지 개수',
    required: true,
  })
  totalChallengeCount!: number | 0;
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
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: '파트너 번호',
  })
  partnerNo!: number | null;
}

export class GetPartnerResDto {
  @IsNumber()
  @ApiPropertyOptional({
    example: 2,
    description: '파트너 번호',
  })
  partnerNo?: number;
}
