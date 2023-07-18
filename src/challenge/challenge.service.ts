import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { add } from 'date-fns';

import { UserService } from '../user/user.service';
import { Challenge, ChallengeDocument } from './schema/challenge.schema';
import { TWOTWO } from '../constants/number';
import { ChallengeCounter, ChallengeCounterDocument } from './schema/challenge-counter.schema';
import { ChallengeResDto, CreateChallenge, ChallengeHistoryResDto } from './dto/challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly userSvc: UserService,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    @InjectModel(ChallengeCounter.name)
    private readonly challengeCounterModel: Model<ChallengeCounterDocument>,
  ) {}

  async createChallenge(challengeInfo: CreateChallenge): Promise<ChallengeResDto> {
    const user1 = await this.userSvc.getUser(challengeInfo.user1No);

    // TODO: Validate 로직 깔끔하게 하기
    if (user1.partnerNo === undefined) throw new Error('파트너가 존재하지 않습니다');
    const user2 = await this.userSvc.getUser(user1.partnerNo);
    const endDate: Date = add(challengeInfo.startDate, { days: TWOTWO });

    const challengeNo = await this.autoIncrement('challengeNo');
    const challenge = await this.challengeModel.create({
      challengeNo,
      name: challengeInfo.name,
      description: challengeInfo.description,
      user1: user1,
      user2: user2,
      startDate: challengeInfo.startDate,
      endDate: endDate,
      user2Flower: challengeInfo.user2Flower,
    });

    await challenge.save();
    return challenge;
  }

  async findChallenge(challengeNo: number): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findOne({ challengeNo }).lean().exec();
    if (challenge === null) throw new NotFoundException('존재하지 않는 챌린지입니다');
    return challenge;
  }

  async findUserChallenges(userNo: number): Promise<ChallengeDocument[]> {
    const challenges = await this.challengeModel.find({
      $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
    });
    return challenges;
  }

  async findRecentChallenge(userNo: number): Promise<ChallengeDocument | null> {
    const challenge = await this.challengeModel
      .findOne({
        $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
      })
      .sort({ challengeNo: -1 });
    return challenge;
  }

  // 승인된 모든 챌린지들
  async countUserChallenges(userNo: number): Promise<number> {
    return this.challengeModel.countDocuments({
      $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
      isApproved: true,
    });
  }

  async acceptChallenge(challengeNo: number, user1Flower: string): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findOneAndUpdate(
      { challengeNo },
      { $set: { user1Flower, isApproved: true } },
      { new: true },
    );
    if (challenge === null) throw new Error('존재하지 않는 챌린지입니다');
    return challenge;
  }

  async deleteChallenge(challengeNo: number): Promise<number> {
    await this.challengeModel.deleteOne({ challengeNo });
    return challengeNo;
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

  async getChallengeHistories({ userNo }: { userNo: number }): Promise<ChallengeHistoryResDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 0으로 설정

    const challenges = await this.challengeModel
      .find(
        {
          $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
          endDate: { $lt: today },
          isFinished: true,
        },
        {
          _id: 0,
          name: 1,
          description: 1,
          user1Flower: 1,
          user2Flower: 1,
          user1CommitCnt: 1,
          user2CommitCnt: 1,
          startDate: 1,
          endDate: 1,
        },
      )
      .lean()
      .exec();

    return challenges;
  }
}
