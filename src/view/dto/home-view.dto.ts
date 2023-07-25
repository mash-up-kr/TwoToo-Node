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
    description: '조회한 사람 정보',
    required: true,
  })
  myInfo: UserInfoResDto;

  @ApiProperty({
    type: CommitResDto,
    description: '조회한 사람의 오늘 인증 정보',
    required: true,
  })
  myCommit: Commit | null;

  @ApiProperty({
    type: UserResDto,
    description: '조회한 사람의 파트너 정보',
    required: true,
  })
  partnerInfo: UserInfoResDto;

  @ApiProperty({
    type: CommitResDto,
    description: '조회한 사람의 파트너의 오늘 인증 정보',
    required: true,
  })
  partnerCommit: Commit | null;

  @IsNumber()
  @ApiProperty({
    example: 3,
    description: '조회한 사람의 오늘 찌르기 한 횟수',
    required: true,
  })
  myStingCnt: number;
}
