import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FlowerType } from './challenge.dto';

export class CreateChallengeTestPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '테스트 - 다이어트 해보자',
    description: '챌린지 이름',
    required: true,
  })
  name!: string;

  @IsString()
  @ApiProperty({
    example: '매일 먹은 음식 사진 찍기',
    description: '챌린지 설명',
  })
  description: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(),
    description: '챌린지 시작일',
    required: true,
  })
  startDate!: Date;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: [0, 3, 8, 9],
    description: 'user1(생성자)의 생성할 챌린지 인증 일자 (1일차, 4일차, 9일차, 10일차)',
    required: true,
  })
  user1CommitDate: number[];

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: [2, 4, 5, 15],
    description: 'user2(수락자)의 생성할 챌린지 인증 일자 (3일차, 5일차, 6일차, 16일차)',
    required: true,
  })
  user2CommitDate: number[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FIG',
    enum: FlowerType,
    description: 'user1(생성자)의 꽃',
    required: true,
  })
  user1Flower: FlowerType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'SUNFLOWER',
    enum: FlowerType,
    description: 'user2(생성자)의 꽃',
    required: true,
  })
  user2Flower: FlowerType;
}

export class UpdateChallengeTestPayload {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '테스트 - 다이어트 해보자',
    description: '챌린지 이름',
  })
  name!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '매일 먹은 음식 사진 찍기',
    description: '챌린지 설명',
  })
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'FIG',
    enum: FlowerType,
    description: 'user1(생성자)의 꽃',
  })
  user1Flower: FlowerType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'SUNFLOWER',
    enum: FlowerType,
    description: 'user2(생성자)의 꽃',
  })
  user2Flower: FlowerType;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(),
    description: '챌린지 시작일',
  })
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(),
    description: '챌린지 종료일',
  })
  endDate!: Date;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'user1(생성자) 현재 챌린지의 인증 횟수',
  })
  user1CommitCnt: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'user2(수락자) 현재 챌린지의 인증 횟수',
  })
  user2CommitCnt: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: '챌린지 승인 여부',
  })
  isApproved!: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: false,
    description: '챌린지 완료 여부',
  })
  isFinished!: boolean;
}
