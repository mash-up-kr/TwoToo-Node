import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { add, endOfDay } from 'date-fns';
import * as _ from 'lodash';
import moment from 'moment';

import { UserService } from '../user/user.service';
import { CommitService } from '../commit/commit.service';
import { Challenge, ChallengeDocument } from './schema/challenge.schema';
import { ChallengeCounter, ChallengeCounterDocument } from './schema/challenge-counter.schema';
import {
  ChallengeHistoryResDto,
  ChallengeResDto,
  CreateChallenge,
  GrowthDiaryState,
  TipMessage,
  UpdateChallengePayload,
} from './dto/challenge.dto';
import { Commit } from 'src/commit/schema/commit.schema';
import { HomeViewService } from 'src/view/homeView.service';
import { HomeViewState } from 'src/view/view.type';

@Injectable()
export class ChallengeService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userSvc: UserService,
    private readonly commitSvc: CommitService,
    private readonly homeViewSvc: HomeViewService,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    @InjectModel(ChallengeCounter.name)
    private readonly challengeCounterModel: Model<ChallengeCounterDocument>,
  ) {}

  async createChallenge(challengeInfo: CreateChallenge): Promise<ChallengeResDto> {
    // user1: 챌린지 생성 요청을 보낸 자
    const user1 = challengeInfo.user1;

    if (_.isNull(user1.partnerNo)) {
      throw new NotFoundException('파트너가 존재하지 않습니다');
    }

    // user2: 챌린지 수락할 자
    const user2 = await this.userSvc.getUser(user1.partnerNo as number);

    try {
      // 파트너가 이미 생성한 챌린지가 있는지 확인
      // [챌린지 찾는 조건]
      // isApproved: false - 아직 수락 안됨
      // user1.userNo === user1.partnerNo - 생성자(user1).userNo === 현재 요청자의 파트너(user2).userNo
      const existingChallenge = await this.challengeModel.findOne({
        isApproved: false,
        'user1.userNo': user2.userNo,
      });

      // 이미 생성된 챌린지가 있는 경우 삭제 후 생성
      if (existingChallenge) {
        await this.deleteChallenge(existingChallenge.challengeNo);
      }

      const endDate: Date = add(endOfDay(challengeInfo.startDate), { days: 21 });
      const challengeNo = await this.autoIncrement('challengeNo');

      const challenge = await this.challengeModel.create({
        challengeNo,
        name: challengeInfo.name,
        description: challengeInfo.description,
        user1: this.userSvc.getPartialUserInfo(user1),
        user2: this.userSvc.getPartialUserInfo(user2),
        startDate: challengeInfo.startDate,
        endDate: endDate,
        user2Flower: challengeInfo.user2Flower,
      });

      await challenge.save();
      return challenge;
    } catch (err) {
      // TODO: error handling for mongodb
      throw new BadRequestException('챌린지 생성에 실패했습니다.');
    }
  }

  async findChallenge(challengeNo: number): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel
      .findOne({ challengeNo, isDeleted: false })
      .lean()
      .exec();
    if (challenge === null) throw new NotFoundException('존재하지 않는 챌린지입니다');
    return challenge;
  }

  async findUserChallenges(userNo: number): Promise<ChallengeDocument[]> {
    const challenges = await this.challengeModel.find({
      $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
      isDeleted: false,
    });
    return challenges;
  }

  async updateChallenge(
    challengeNo: number,
    challengeInfo: UpdateChallengePayload,
  ): Promise<ChallengeDocument> {
    const challenge: ChallengeDocument | null = await this.challengeModel.findOneAndUpdate(
      { challengeNo, isDeleted: false },
      challengeInfo,
      {
        new: true,
      },
    );
    if (challenge === null) throw new NotFoundException('존재하지 않는 챌린지입니다');
    return challenge;
  }

  //  삭제된 챌린지를 제외 하고 챌린지도 함께 조회한다.
  async findRecentChallenge(userNo: number): Promise<ChallengeDocument | null> {
    const challenge = await this.challengeModel
      .findOne({
        $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
        isDeleted: false,
      })
      .sort({ challengeNo: -1 });
    return challenge;
  }

  // 승인된 모든 챌린지들
  async countUserChallenges(userNo: number): Promise<number> {
    return this.challengeModel.countDocuments({
      $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
      isApproved: true,
      isDeleted: false,
    });
  }

  async acceptChallenge(challengeNo: number, user1Flower: string): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findOneAndUpdate(
      { challengeNo, isDeleted: false },
      { $set: { user1Flower, isApproved: true } },
      { new: true },
    );
    if (challenge == null) throw new NotFoundException('존재하지 않는 챌린지입니다');
    return challenge;
  }

  async deleteChallenge(challengeNo: number): Promise<number> {
    await this.challengeModel.findOneAndUpdate({ challengeNo }, { $set: { isDeleted: true } });
    await this.commitSvc.deleteCommitWithChallengeNo(challengeNo);

    return challengeNo;
  }

  async deleteAllChallenges(userNo: number): Promise<void> {
    await this.challengeModel.updateMany(
      {
        $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
      },
      {
        $set: { isDeleted: true },
      },
    );
  }

  async finishChallenge(challengeNo: number): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findOneAndUpdate(
      { challengeNo, isDeleted: false },
      { $set: { isFinished: true } },
      { new: true },
    );
    if (challenge == null) throw new NotFoundException('존재하지 않는 챌린지입니다');
    return challenge;
  }

  private async autoIncrement(key: string) {
    let result: { count: number } | null = null;

    while (result === null) {
      result = await this.challengeCounterModel.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { upsert: true, returnOriginal: false },
      );
    }

    return result!.count;
  }

  async getChallengeHistory({
    userNo,
  }: {
    userNo: number;
  }): Promise<ChallengeHistoryResDto[] | []> {
    const finishedChallenges = await this.challengeModel
      .find(
        {
          $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
          isFinished: true,
          isDeleted: false,
        },
        { _id: 0 },
      )
      .lean()
      .exec();
    const finishedChallengesAddedState = finishedChallenges.map((challenge) => {
      return {
        challengeNo: challenge.challengeNo,
        name: challenge.name,
        description: challenge.description,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        user1CommitCnt: challenge.user1CommitCnt,
        user2CommitCnt: challenge.user2CommitCnt,
        user1Flower: challenge.user1Flower,
        user2Flower: challenge.user2Flower,
        user1No: challenge.user1.userNo,
        user2No: challenge.user2.userNo,
        viewState: 'Finished',
      };
    });

    const inProgressChallege = await this.challengeModel
      .find({
        $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
        isApproved: true,
        isFinished: false,
        isDeleted: false,
      })
      .lean()
      .exec();
    const inProgressChallegeAddedState = inProgressChallege
      .map((challenge) => {
        const challengeState = this.homeViewSvc.getHomeViewState(challenge, userNo);
        if (challengeState === HomeViewState.IN_PROGRESS) {
          return {
            challengeNo: challenge.challengeNo,
            name: challenge.name,
            description: challenge.description,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            user1CommitCnt: challenge.user1CommitCnt,
            user2CommitCnt: challenge.user2CommitCnt,
            user1Flower: challenge.user1Flower,
            user2Flower: challenge.user2Flower,
            user1No: challenge.user1.userNo,
            user2No: challenge.user2.userNo,
            viewState: 'InProgress',
          };
        }
        return null;
      })
      .filter((item): item is ChallengeHistoryResDto => item !== null);

    const histories = [...finishedChallengesAddedState, ...inProgressChallegeAddedState];

    return histories || [];
  }

  private getCommitResultOfChallenge(startDate: Date, commitList: Commit[]) {
    const today: Date = new Date();
    const yesterday: Date = new Date();
    yesterday.setDate(today.getDate() - 1);
    const endDate: Date = new Date(startDate);
    endDate.setDate(startDate.getDate() + 21); // 챌린지 시작일로부터 22일 지남

    let isCommittedTodayOrYesterday = false;

    const growthStateList: GrowthDiaryState[] = [];

    // startDate부터 endDate까지의 날짜 배열 생성
    const dateRange: Date[] = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dateRange.push(new Date(date));
    }

    // date에 Commit이 있는지 확인
    for (const date of dateRange) {
      const dateString: string = date.toLocaleDateString();
      const isCommitExist: boolean = commitList.some(
        (commit: Commit) => moment(commit.createdAt).format('M/DD/YYYY') === dateString,
      );

      // 어제나 오늘 인증이 있는지 확인
      if (
        (dateString === yesterday.toLocaleDateString() ||
          dateString === today.toLocaleDateString()) &&
        isCommitExist
      ) {
        isCommittedTodayOrYesterday = true;
      }

      // today 이후: NOT_COMMIT
      // today 이전: Commit 여부에 따라 SUCCESS, FAIL 기록
      // today: Commit했을 경우 SUCCESS, 안했을 경우 NOT_COMMIT
      if (date < today || (date.getTime() === today.getTime() && isCommitExist)) {
        growthStateList.push(isCommitExist ? GrowthDiaryState.SUCCESS : GrowthDiaryState.FAIL);
      } else {
        growthStateList.push(GrowthDiaryState.NOT_COMMIT);
      }
    }

    return { growthStateList, isCommittedTodayOrYesterday };
  }

  async getUserGrowthDiaryData({
    userNo,
    challengeNo,
    startDate,
  }: {
    userNo: number;
    challengeNo: number;
    startDate: Date;
  }) {
    const commitList = await this.commitSvc.getCommitListRecently(challengeNo, userNo);
    const { growthStateList, isCommittedTodayOrYesterday } = this.getCommitResultOfChallenge(
      startDate,
      commitList,
    );

    let tipMessage = TipMessage.FAIL0; // 기본값

    // Commit 성공 횟수 계산
    const successCount = growthStateList.reduce(
      (count, item) => (item === GrowthDiaryState.SUCCESS ? count + 1 : count),
      0,
    );
    const failCount = growthStateList.reduce(
      (count, item) => (item === GrowthDiaryState.FAIL ? count + 1 : count),
      0,
    );

    // 7번 이상 Commit 실패 시: 실패 메세지 (FAIL4) 표시
    if (failCount > 6) {
      tipMessage = TipMessage.FAIL4;
    } else {
      // 어제나 오늘 Commit 성공 시: 성공 메세지 (COMMIT 1~16) 표시
      // 어제나 오늘 Commit 실패 시: 실패 메세지 (FAIL 0~3) 표시
      if (isCommittedTodayOrYesterday) {
        const tipCount = Math.min(16, successCount);
        tipMessage = TipMessage[`COMMIT${tipCount}`];
      } else {
        const tipCount = Math.min(failCount, 6);
        tipMessage = TipMessage[`FAIL${Math.floor((tipCount + 1) / 2)}`];
      }
    }

    return { tipMessage, growthStateList, successCount };
  }
}
