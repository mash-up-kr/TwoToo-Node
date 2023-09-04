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
import { UserInfoResDto } from '../../user/dto/user.dto';
import { CommitResDto } from 'src/commit/dto/commit.dto';
import { User } from 'src/user/schema/user.schema';
import { HomeViewState, HomeViewStateType } from 'src/view/view.type';

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
    required: true,
  })
  name!: string;

  @IsString()
  @ApiProperty({
    example: '매일 운동 인증을 하는 챌린지',
    description: '챌린지 설명',
  })
  description: string;

  @IsNotEmpty()
  @ApiProperty({ type: UserInfoResDto, description: 'user1 - 챌린지 생성자', required: true })
  user1!: UserInfoResDto;

  @IsNotEmpty()
  @ApiProperty({ type: UserInfoResDto, description: 'user2 - 챌린지 수락자', required: true })
  user2!: UserInfoResDto;

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

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(new Date().getTime() + 86400000 * 23),
    description: '챌린지 종료일',
    required: true,
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

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: '챌린지 승인 여부',
    required: true,
  })
  isApproved!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    description: '챌린지 완료 여부',
    required: true,
  })
  isFinished!: boolean;
}

export class ChallengeAndCommitListResDto extends ChallengeResDto {
  @IsArray()
  @ApiProperty({
    type: [CommitResDto],
    description: 'user1 Commit 리스트',
    required: true,
  })
  user1CommitList!: CommitResDto[];

  @IsArray()
  @ApiProperty({
    type: [CommitResDto],
    description: 'user2 Commit 리스트',
    required: true,
  })
  user2CommitList!: CommitResDto[];
}

export class CreateChallengePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '아침 7시 기상',
    description: '챌린지 이름',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: '매일 운동 인증을 하는 챌린지',
    description: '챌린지 설명',
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'SUNFLOWER',
    enum: FlowerType,
    description: 'user2(수락자)의 꽃',
    required: true,
  })
  user2Flower: FlowerType;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(),
    description: '챌린지 시작일',
  })
  startDate!: Date;
}

export class AcceptChallengePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FIG',
    enum: FlowerType,
    description: 'user1(생성자)의 꽃',
    required: true,
  })
  user1Flower: FlowerType;
}

export class CreateChallenge {
  name: string;
  description: string;
  user1: User;
  user2Flower: string;
  startDate: Date;
}

export class UpdateChallengePayload {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '아침 7시 기상',
    description: '챌린지 이름',
    required: true,
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '매일 운동 인증을 하는 챌린지',
    description: '챌린지 설명',
  })
  description: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  user1No: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 2,
  })
  user2No: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'FIG',
    enum: FlowerType,
    description: 'user1(생성자)의 꽃',
  })
  user1Flower: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'FIG',
    enum: FlowerType,
    description: 'user2(생성자)의 꽃',
  })
  user2Flower: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    type: String,
    format: 'date',
    description: '챌린지 시작일',
  })
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    type: String,
    format: 'date',
    description: '챌린지 종료일',
  })
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: '수락 여부',
  })
  isApproved: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: '종료 여부',
  })
  isFinished: boolean;
}

export class ChallengeHistoryResDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '홈 화면 상태',
    required: true,
    enum: HomeViewState,
  })
  viewState: HomeViewStateType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '챌린지 번호',
    required: true,
  })
  challengeNo: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '아침 7시 기상',
    description: '챌린지 이름',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: '매일 운동 인증을 하는 챌린지',
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
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(new Date().getTime() + 86400000 * 23),
    description: '챌린지 종료일',
    required: true,
  })
  endDate: Date;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  user1No: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 2,
  })
  user2No: number;

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
