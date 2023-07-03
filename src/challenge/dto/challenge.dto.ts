import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserResDto } from '../../user/dto/user.dto';

export class ChallengeResDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '챌린지 번호',
    required: true,
  })
  challengeNo!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '아침 7시 기상',
    description: '챌린지 이름',
  })
  name: string;

  @ApiProperty({ type: UserResDto })
  user1: UserResDto; // 챌린지 생성자

  @ApiProperty({ type: UserResDto })
  user2: UserResDto; // 챌린지 수락자

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    default: new Date(),
  })
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    default: new Date(new Date().getTime() + 86400000 * 23),
  })
  endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    description: 'user1(생성자) 현재 챌린지의 인증 횟수',
    required: true,
  })
  user1CommitCnt: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    description: 'user2(수락자) 현재 챌린지의 인증 횟수',
    required: true,
  })
  user2CommitCnt: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '민들레꽃',
    description: 'user1(생성자)의 꽃',
  })
  user1Flower: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '민들레꽃',
    description: 'user2(생성자)의 꽃',
  })
  user2Flower: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: '챌린지 승인 여부',
  })
  isApproved: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    description: '챌린지 완료 여부',
  })
  isFinished: boolean;
}

export class CreateChallengePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '아침 7시 기상',
    description: '챌린지 이름',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '민들레꽃',
    description: 'user2(수락자)의 꽃',
  })
  user2Flower: string;
}

export class ApproveChallengePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '민들레꽃',
    description: 'user1(생성자)의 꽃',
  })
  user1Flower: string;
}

export class CreateChallenge {
  name: string;
  user1No: number;
  user2Flower: string;
  startDate: Date;
}
