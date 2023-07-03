import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';

import { Commit, CommitDocument } from './schema/commit.schema';
import { CommitCounter, CommitCounterDocument } from './schema/commit-counter.schema';
import { CommitPayload } from './dto/commit.dto';
import { Challenge, ChallengeDocument } from '../challenge/schema/challenge.schema';
import { startOfToday } from 'date-fns';

@Injectable()
export class CommitService {
  constructor(
    @InjectModel(Commit.name)
    private readonly commitModel: Model<CommitDocument>,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    @InjectModel(CommitCounter.name)
    private readonly commitCounterModel: Model<CommitCounterDocument>,
  ) {}

  async createCommit({
    userNo,
    data,
  }: {
    userNo: number;
    data: CommitPayload;
  }): Promise<Commit> {
    const commitNo = await this.autoIncrement('commitNo');
    const commit = await this.commitModel.create({
      commitNo,
      userNo: userNo,
      text: data.text,
      photoUrl: data.photoUrl,
      partnerComment: '',
    });

    const curChallenge = await this.challengeModel
      .findOneAndUpdate(
        {
          $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
        },
        {
          $inc: {
            user1CommitCount: { $cond: [{ $eq: ['$user1.userNo', userNo] }, 1, 0] },
            user2CommitCount: { $cond: [{ $eq: ['$user2.userNo', userNo] }, 1, 0] },
          },
        },
        {
          new: true,
          sort: { endDate: -1 },
        },
      )
      .exec();

    if (_.isNull(curChallenge)) {
      throw new Error('Not Found Challenge');
    }

    return commit;
  }

  async updateCommit({
    commitNo,
    partnerComment,
  }: {
    commitNo: number;
    partnerComment: string;
  }): Promise<Commit> {
    const updatedCommit = await this.commitModel.findOneAndUpdate(
      { commitNo: commitNo },
      { $set: { partnerComment: partnerComment, updatedAt: new Date() } },
      { new: true },
    );

    if (_.isNull(updatedCommit)) {
      throw new Error('Not Found Commit');
    }

    return updatedCommit;
  }

  async getCommit(commitNo: number): Promise<Commit> {
    const commit = await this.commitModel.findOne({ commitNo: commitNo }).lean();

    if (_.isNull(commit)) {
      throw new Error('Not Found Commit');
    }

    return commit;
  }

  async getTodayCommit(userNo: number): Promise<CommitDocument | null> {
    const commit = await this.commitModel
      .findOne({
        userNo: userNo,
        createdAt: {
          $gte: startOfToday(),
        },
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
}
