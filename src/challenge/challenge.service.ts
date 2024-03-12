import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { add, endOfDay, startOfDay, subDays } from 'date-fns';
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
import { CreateChallengeTestPayload, UpdateChallengeTestPayload } from './dto/challenge-test.dto';
import { User } from '../user/schema/user.schema';

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
    challengeInfo:
      | UpdateChallengePayload // normal
      | UpdateChallengeTestPayload // Test-API PATCH 용
      | { user1CommitCnt: number; user2CommitCnt: number }, // Test-API POST용
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

    const growthList: GrowthDiaryState[] = [];

    const dateRange: Date[] = [];
    for (let date = new Date(startDate); date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
      dateRange.push(new Date(date));
    }

    for (const date of dateRange) {
      const dateString: string = moment(date).utc().format('M/DD/YYYY');
      const isCommitExist: boolean = commitList.some(
        (commit: Commit) => moment(commit.createdAt).utc().format('M/DD/YYYY') === dateString,
      );

      // 어제나 오늘 인증이 있는지 확인
      if (
        (dateString === moment(yesterday).utc().format('M/DD/YYYY') ||
          dateString === moment(today).utc().format('M/DD/YYYY')) &&
        isCommitExist
      ) {
        isCommittedTodayOrYesterday = true;
      }

      // 날짜(date)에 해당하는 Commit 있음: SUCCESS
      // 날짜(date)가 조회 시점(today)보다 미래인 경우: NOT_COMMIT
      // 날짜(date)가 조회 시점(today)보다 과거인 경우: FAIL
      if (isCommitExist) {
        growthList.push(GrowthDiaryState.SUCCESS);
      } else {
        growthList.push(date > today ? GrowthDiaryState.NOT_COMMIT : GrowthDiaryState.FAIL);
      }
    }

    return { growthList, isCommittedTodayOrYesterday };
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
    const { growthList, isCommittedTodayOrYesterday } = this.getCommitResultOfChallenge(
      startDate,
      commitList,
    );

    let tipMessage = TipMessage.FAIL0; // 기본값

    // Commit 성공 횟수 계산
    const successCount = growthList.reduce(
      (count, item) => (item === GrowthDiaryState.SUCCESS ? count + 1 : count),
      0,
    );
    const failCount = growthList.reduce(
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

    return { tipMessage, growthList, successCount };
  }

  // TEST API 용
  createDummyCommits = async (
    challengeNo: number,
    startDate: Date,
    userNo: number,
    daysAfter: number,
    isRequester: boolean,
  ) => {
    const commitData = {
      userNo: userNo,
      text: `자동 생성 커밋 - ${daysAfter + 1}일차 - ${
        isRequester ? '챌린지 생성자' : '챌린지 수락자'
      }`,
      photoUrl: `https://twotoo-dev.s3.ap-northeast-2.amazonaws.com/nothinghill_1709129516396.jpg`,
      partnerCommit: `자동 생성 파트너 칭찬 - ${daysAfter}일차`,
      createdAt: startDate,
    };

    await this.commitSvc.createDummyCommitForTest(challengeNo, commitData);
  };

  async createChallengeForTest(data: CreateChallengeTestPayload, creater: User) {
    const challengeCreateInfo: any = data;

    // challenge startDate를 바탕으로 시작일, 종료일 설정
    challengeCreateInfo.startDate = startOfDay(new Date(data.startDate)) as Date;
    challengeCreateInfo.endDate = add(endOfDay(challengeCreateInfo.startDate), { days: 21 });

    // user1 설정
    challengeCreateInfo.user1 = creater;

    try {
      const challenge = await this.createChallenge(challengeCreateInfo);

      const user1CommitDate: number[] = data.user1CommitDate;
      const user2CommitDate: number[] = data.user2CommitDate;

      const user1Promises = user1CommitDate.map(async (daysAfter: number) => {
        const updatedDate = add(endOfDay(challenge.startDate), { days: daysAfter, hours: 16 });
        return this.createDummyCommits(
          challenge.challengeNo,
          updatedDate,
          challenge.user1.userNo,
          daysAfter,
          true,
        );
      });

      const user2Promises = user2CommitDate.map(async (daysAfter: number) => {
        const updatedDate = add(endOfDay(challenge.startDate), { days: daysAfter, hours: 16 });
        return this.createDummyCommits(
          challenge.challengeNo,
          updatedDate,
          challenge.user2.userNo,
          daysAfter,
          false,
        );
      });

      await Promise.all([...user1Promises, ...user2Promises]);

      // user1CommitCnt, user2CommitCnt 개수 업데이트
      // isApproved 처리, user1Flower 추가
      const user1CommitCnt = data.user1CommitDate.length;
      const user2CommitCnt = data.user2CommitDate.length;
      const updatedChallenge = await this.updateChallenge(challenge.challengeNo, {
        user1CommitCnt,
        user2CommitCnt,
        isApproved: true,
        user1Flower: data.user1Flower,
      });

      return updatedChallenge;
    } catch (err) {
      throw new BadRequestException('챌린지 생성에 실패했습니다.');
    }
  }

  async updateChallengeForTest(challengeNo: number, data: UpdateChallengeTestPayload) {
    const challenge = await this.findChallenge(challengeNo);

    const updateInfo: any = { ...data };

    if (_.has(data, 'user1') || _.has(data, 'user2')) {
      throw new BadRequestException(`user1, user2 정보는 변경할 수 없어요.`);
    }

    if (_.has(data, 'challengeNo')) {
      throw new BadRequestException(`challengeNo는 변경할 수 없어요.`);
    }

    if (_.has(data, 'endDate') && _.has(data, 'startDate')) {
      throw new BadRequestException(`startDate과 endDate중 하나만 선택하세요.`);
    }

    if (_.has(data, 'startDate')) {
      updateInfo.startDate = startOfDay(updateInfo.startDate);
      updateInfo.endDate = add(endOfDay(updateInfo.startDate), { days: 21 });
    } else if (_.has(data, 'endDate')) {
      updateInfo.endDate = endOfDay(updateInfo.endDate);
      updateInfo.startDate = subDays(startOfDay(updateInfo.endDate), 21);
    }

    try {
      const updatedChallenge = await this.updateChallenge(challenge.challengeNo, updateInfo);
      return updatedChallenge;
    } catch (err) {
      throw new BadRequestException('챌린지 업데이트에 실패했습니다.');
    }
  }
}
