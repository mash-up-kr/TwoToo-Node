import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserResDto } from '../../user/dto/user.dto';

export enum FlowerType {
  FIG = 'FIG',
  TULIP = 'TULIP',
  ROSE = 'ROSE',
  COTTON = 'COTTON',
  CHRYSANTHEMUM = 'CHRYSANTHEMUM',
  SUNFLOWER = 'SUNFLOWER',
  CAMELLIA = 'CAMELLIA',
  DELPHINIUM = 'DELPHINIUM',
}

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
  name!: string;

  @IsNotEmpty()
  @ApiProperty({ type: UserResDto, description: 'user1 - 챌린지 생성자' })
  user1!: UserResDto;

  @IsNotEmpty()
  @ApiProperty({ type: UserResDto, description: 'user2 - 챌린지 수락자' })
  user2!: UserResDto;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    default: new Date(),
    description: '챌린지 시작일',
  })
  startDate!: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    default: new Date(new Date().getTime() + 86400000 * 23),
    description: '챌린지 종료일',
  })
  endDate!: Date;

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
    enum: FlowerType,
    description: 'user1(생성자)의 꽃',
  })
  user1Flower: FlowerType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '해바라기',
    enum: FlowerType,
    description: 'user2(생성자)의 꽃',
  })
  user2Flower: FlowerType;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: '챌린지 승인 여부',
  })
  isApproved!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    description: '챌린지 완료 여부',
  })
  isFinished!: boolean;
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
    example: '해바라기',
    enum: FlowerType,
    description: 'user2(수락자)의 꽃',
  })
  user2Flower: FlowerType;
}

export class AcceptChallengePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '민들레꽃',
    enum: FlowerType,
    description: 'user1(생성자)의 꽃',
  })
  user1Flower: FlowerType;
}

export class CreateChallenge {
  name: string;
  user1No: number;
  user2Flower: string;
  startDate: Date;
}
