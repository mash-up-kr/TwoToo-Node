import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserResDto } from '../../user/dto/user.dto';
import { CommitResDto } from 'src/commit/dto/commit.dto';

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
  @ApiProperty({ type: UserResDto, description: 'user1 - 챌린지 생성자', required: true })
  user1!: UserResDto;

  @IsNotEmpty()
  @ApiProperty({ type: UserResDto, description: 'user2 - 챌린지 수락자', required: true })
  user2!: UserResDto;

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
  user1No: number;
  user2Flower: string;
  startDate: Date;
}

export class ChallengeHistoryResDto {
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
}
