import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import _ from 'lodash';
import { Model } from 'mongoose';

import { Commit, CommitDocument } from './schema/commit.schema';
import { CommitCounter, CommitCounterDocument } from './schema/commit-counter.schema';
import { CommitCreatePayload } from './dto/commit.dto';


@Injectable()
export class CommitService {
  constructor(
    @InjectModel(Commit.name)
    private readonly commitModel: Model<CommitDocument>,
    @InjectModel(CommitCounter.name)
    private readonly commitCounterModel: Model<CommitCounterDocument>
  ) { }

  async createCommit({ payload, userNo }: { payload: CommitCreatePayload, userNo: string }): Promise<Commit> {
    const commitNo = await this.autoIncrement('commitNo');
    const commit = await this.commitModel.create({
      commitNo,
      userNo: userNo,
      text: payload.text,
      photoUrl: payload.photoUrl,
      partnerComment: '',
    });

    // TODO: ChallengeCollection user1CommitCnt +1
    return commit;
  }

  async updateCommit(
    { commitNo, partnerComment }: { commitNo: string, partnerComment: string }
  ): Promise<Commit> {
    const updatedCommit = await this.commitModel.findOneAndUpdate(
      { commitNo: commitNo },
      {
        $set: { partnerComment: partnerComment },
      },
      { new: true }
    );

    return updatedCommit;
  }

  async getCommit(commitNo: number): Promise<Commit> {
    const commit = await this.commitModel.findOne({ commitNo: commitNo }).lean();

    if (!commit) {
      throw new Error('Not Found Commit');
    }

    return commit;
  }

  private async autoIncrement(key: string) {
    let result: { count: number } | null = null;

    while (result === null) {
      result = await this.commitCounterModel.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { upsert: true, returnOriginal: false }
      );
    }

    return result!.count;
  }
}