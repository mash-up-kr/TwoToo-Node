import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { endOfToday, startOfToday } from 'date-fns';

import { CommitPayload } from './dto/commit.dto';
import { Commit, CommitDocument } from './schema/commit.schema';
import { User, UserDocument } from '../user/schema/user.schema';
import { Challenge, ChallengeDocument } from '../challenge/schema/challenge.schema';
import { CommitCounter, CommitCounterDocument } from './schema/commit-counter.schema';

@Injectable()
export class CommitService {
  constructor(
    @InjectModel(Commit.name)
    private readonly commitModel: Model<CommitDocument>,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    @InjectModel(CommitCounter.name)
    private readonly commitCounterModel: Model<CommitCounterDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createCommit({ userNo, data }: { userNo: number; data: CommitPayload }): Promise<Commit> {
    const today = new Date();
    const inProgressChallenge = await this.challengeModel.findOne({
      challengeNo: data.challengeNo,
      startDate: { $lte: today },
      endDate: { $gte: today },
      isApproved: true,
      isFinished: false,
      isDeleted: false,
    });

    if (_.isNull(inProgressChallenge)) {
      throw new BadRequestException('진행중인 챌린지가 아닙니다.');
    }

    const todayCommit = await this.commitModel.findOne({
      challengeNo: inProgressChallenge.challengeNo,
      userNo: userNo,
      createdAt: { $gte: startOfToday(), $lte: endOfToday() },
      isDeleted: false,
    });

    if (todayCommit) {
      throw new BadRequestException('오늘 이미 인증을 했습니다.');
    }

    const commitNo = await this.autoIncrement('commitNo');
    const commit = await this.commitModel.create({
      commitNo,
      challengeNo: data.challengeNo,
      userNo: userNo,
      text: data.text,
      photoUrl: data.photoUrl,
      partnerComment: '',
    });

    const curChallenge = await this.challengeModel.findOneAndUpdate(
      {
        challengeNo: data.challengeNo,
        $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
        isDeleted: false,
      },
      [
        {
          $set: {
            user1CommitCnt: {
              $cond: {
                if: { $eq: ['$user1.userNo', userNo] },
                then: { $add: ['$user1CommitCnt', 1] },
                else: '$user1CommitCnt',
              },
            },
            user2CommitCnt: {
              $cond: {
                if: { $eq: ['$user2.userNo', userNo] },
                then: { $add: ['$user2CommitCnt', 1] },
                else: '$user2CommitCnt',
              },
            },
          },
        },
      ],
      {
        new: true,
        sort: { endDate: -1 },
      },
    );

    if (_.isNull(curChallenge)) {
      throw new NotFoundException('존재하지 않는 챌린지입니다.');
    }

    return commit;
  }

  async updateCommit({
    partnerCommitNo,
    comment,
    userNo,
  }: {
    partnerCommitNo: number;
    comment: string;
    userNo: number;
  }): Promise<Commit> {
    const userInfo = await this.userModel.findOne({ userNo: userNo });
    if (_.isNull(userInfo)) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    const commitInfo = await this.commitModel.findOne({
      commitNo: partnerCommitNo,
      isDeleted: false,
    });
    if (_.isNull(commitInfo)) {
      throw new BadRequestException('존재하지 않는 인증 정보입니다.');
    }

    if (commitInfo.partnerComment !== '') {
      throw new ConflictException('오늘 이미 칭찬을 완료했습니다.');
    }

    if (userInfo.partnerNo !== commitInfo.userNo) {
      throw new ForbiddenException('해당 유저 파트너의 인증 정보가 아닙니다.');
    }

    const updatedCommit = await this.commitModel.findOneAndUpdate(
      { commitNo: partnerCommitNo, isDeleted: false },
      { $set: { partnerComment: comment, updatedAt: new Date() } },
      { new: true },
    );

    if (_.isNull(updatedCommit)) {
      throw new BadRequestException('존재하지 않는 인증 정보입니다.');
    }

    return updatedCommit;
  }

  async getCommit(commitNo: number, userNo: number): Promise<Commit> {
    const commit = await this.commitModel.findOne({ commitNo: commitNo, isDeleted: false }).lean();

    if (_.isNull(commit)) {
      throw new NotFoundException('존재하지 않는 인증 정보입니다.');
    }

    if (commit.userNo !== userNo) {
      throw new ForbiddenException('해당 유저의 인증 정보가 아닙니다.');
    }
    commit.updatedAt.setHours(commit.updatedAt.getHours() + 9);
    commit.createdAt.setHours(commit.createdAt.getHours() + 9);
    return commit;
  }

  async getTodayCommit(userNo: number, challengeNo: number): Promise<CommitDocument | null> {
    const commit = await this.commitModel
      .findOne({
        userNo: userNo,
        challengeNo,
        createdAt: { $gte: startOfToday(), $lte: endOfToday() },
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .lean();

    return commit;
  }

  private async autoIncrement(key: string) {
    let result: { count: number } | null = null;

    while (result === null) {
      result = await this.commitCounterModel.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { upsert: true, returnOriginal: false },
      );
    }

    return result!.count;
  }

  async getCommitList(challengeNo: number, userNo: number): Promise<CommitDocument[]> {
    const result = await this.commitModel.find({
      challengeNo: challengeNo,
      userNo: userNo,
      isDeleted: false,
    });

    return result;
  }
  async getCommitListRecently(challengeNo: number, userNo: number): Promise<CommitDocument[]> {
    const result = await this.commitModel
      .find({
        challengeNo: challengeNo,
        userNo: userNo,
        isDeleted: false,
      })
      .sort({ _id: -1 });

    return result;
  }

  async deleteCommit(commitNo: number): Promise<CommitDocument> {
    const deletedCommit = (await this.commitModel.findOneAndUpdate(
      { commitNo },
      { $set: { isDeleted: true } },
    )) as CommitDocument;
    return deletedCommit;
  }

  async deleteCommitWithChallengeNo(challengeNo: number): Promise<void> {
    await this.commitModel.updateMany({ challengeNo }, { $set: { isDeleted: true } });

    return;
  }
}
