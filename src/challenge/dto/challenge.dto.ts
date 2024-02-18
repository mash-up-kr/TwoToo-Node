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

export enum GrowthDiaryState {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  NOT_COMMIT = 'NOT_COMMIT',
}

export const TipMessage: { [key: string]: string } = {
  COMMIT1: '4번 더 물을 주면 이파리로 성장해요!',
  COMMIT2: '이파리까지 3번만 더 힘내봐요',
  COMMIT3: '이파리까지 2번 남았어요!',
  COMMIT4: '오~ 곧 이파리로 성장하기 직전이에요!',
  COMMIT5: '5번 더 물을 주면 봉우리로 성장해요!',
  COMMIT6: '봉우리가 되기까지 4번 남았어요!',
  COMMIT7: '3번 더 물을 주면 봉우리로 성장해요!',
  COMMIT8: '봉우리가 되기까지 2번만 더 힘내봐요!',
  COMMIT9: '엇.. 곧 봉우리로 성장하기 직전이에요!',
  COMMIT10: '6번 더 물을 주면 꽃으로 성장해요!',
  COMMIT11: '5번 더 물을 주면 꽃으로 성장해요!',
  COMMIT12: '꽃이 되기까지 4번 남았어요!',
  COMMIT13: '3번 더 물을 주면 꽃으로 성장해요!',
  COMMIT14: '꽃이 되기까지 2번만 더 힘내봐요!',
  COMMIT15: '두둥.. 곧 꽃으로 성장하기 직전이에요!',
  COMMIT16: '모든 인증을 완료하면 더 특별한 꽃이 필지도 몰라요!',
  FAIL0: '1번 더 물을 주면 새싹으로 성장해요!',
  FAIL1: '잘 하고 있어요! 앞으로 더 열심히 꽃을 키워봐요!',
  FAIL2: '아직 포기하긴 일러요! 조금만 더 화이팅!',
  FAIL3: '두 번 더 실패하면 꽃을 못볼지도 몰라요..\\0ㅁ0//',
};

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
    example: 'Finished',
    description: '홈 화면 상태',
    required: true,
  })
  viewState: string;

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

class GrowthDiaryData {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왕자',
    description: '유저 이름',
    required: true,
  })
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '엇.. 곧 봉우리로 성장하기 직전이에요!',
    description: '팁 메세지',
    enum: TipMessage,
    required: true,
  })
  tipMessage!: string;

  @IsArray()
  @ApiProperty({
    type: [GrowthDiaryState],
    description: '성장일지 리스트',
    required: true,
    isArray: true,
    example: [
      'SUCCESS',
      'FAIL',
      'SUCCESS',
      'SUCCESS',
      'FAIL',
      'FAIL',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'FAIL',
      'SUCCESS',
      'FAIL',
      'NOT_COMMIT',
      'NOT_COMMIT',
      'NOT_COMMIT',
      'NOT_COMMIT',
      'NOT_COMMIT',
      'NOT_COMMIT',
      'NOT_COMMIT',
    ],
  })
  growthList!: GrowthDiaryState[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    description: '진행중인 인증 개수',
    required: true,
  })
  successCount: number;
}

export class GrowthDiaryResDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '아침 7시 기상',
    description: '챌린지 이름',
    required: true,
  })
  challengeName!: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    default: new Date(),
    description: '챌린지 시작일',
    required: true,
  })
  challengeStartDate!: Date;

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
  challengeEndDate!: Date;

  @IsNotEmpty()
  @ApiProperty({ type: GrowthDiaryData, description: '내 성장 일지 데이터', required: true })
  my!: GrowthDiaryData;

  @IsNotEmpty()
  @ApiProperty({ type: GrowthDiaryData, description: '파트너 성장 일지 데이터', required: true })
  partner!: GrowthDiaryData;
}
