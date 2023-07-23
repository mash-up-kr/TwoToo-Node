import { Commit } from '../../commit/schema/commit.schema';
import { Challenge } from '../../challenge/schema/challenge.schema';
import { HomeViewState, HomeViewStateType } from '../view.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ChallengeResDto } from 'src/challenge/dto/challenge.dto';
import { CommitResDto } from 'src/commit/dto/commit.dto';
import { UserResDto, UserInfoResDto } from '../../user/dto/user.dto';

export class HomeViewResDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '홈 화면 상태',
    required: true,
    enum: HomeViewState,
  })
  viewState!: HomeViewStateType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    description: '전체 진행한 챌린지 횟수',
    required: true,
  })
  challengeTotal!: number;

  @ApiProperty({
    type: ChallengeResDto,
    description: '현재 진행중인 챌린지 정보',
    required: true,
  })
  onGoingChallenge: Challenge | null;

  @ApiProperty({
    type: UserResDto,
    description: 'user1(생성자) 정보',
    required: true,
  })
  user1: UserInfoResDto;

  @ApiProperty({
    type: CommitResDto,
    description: 'user1(생성자)의 오늘 인증 정보',
    required: true,
  })
  user1Commit: Commit | null;

  @ApiProperty({
    type: UserResDto,
    description: 'user2(수락자) 정보',
    required: true,
  })
  user2: UserInfoResDto;

  @ApiProperty({
    type: CommitResDto,
    description: 'user2(수락자)의 오늘 인증 정보',
    required: true,
  })
  user2Commit: Commit | null;

  @IsNumber()
  @ApiProperty({
    example: 3,
    description: '현재 유저의 오늘 찌르기 한 횟수',
    required: true,
  })
  userStingCnt: number;
}
