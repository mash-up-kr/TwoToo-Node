import { Commit } from '../../commit/schema/commit.schema';
import { Challenge } from '../../challenge/schema/challenge.schema';
import { HomeViewState, HomeViewStateType } from '../view.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ChallengeResDto } from 'src/challenge/dto/challenge.dto';
import { CommitResDto } from 'src/commit/dto/commit.dto';

export class HomeViewResDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "홈 화면 상태",
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
    description: '현재 진행중인 챌린지 정보'
  })
  onGoingChallenge: Challenge | null;

  @ApiProperty({
    type: CommitResDto,
    description: 'user1(생성자)의 오늘 인증 정보'
  })
  user1Commit: Commit | null;

  @ApiProperty({
    type: CommitResDto,
    description: 'user2(수락자)의 오늘 인증 정보'
  })
  user2Commit: Commit | null;
}
