import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge, ChallengeDocument } from './schema/challenge.schema';
import { Model } from 'mongoose';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UserService } from '../user/user.service';
import { add } from 'date-fns';
import { TWOTWO } from '../constants/number';
import { ChallengeCounter, ChallengeCounterDocument } from './schema/challenge-counter.schema';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly userSvc: UserService,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    @InjectModel(ChallengeCounter.name)
    private readonly challengeCounterModel: Model<ChallengeCounterDocument>,
  ) {}

  async createChallenge(createChallengeDto: CreateChallengeDto): Promise<ChallengeDocument> {
    const user1 = await this.userSvc.getUser(createChallengeDto.user1No);
    // TODO: Validate 로직 깔끔하게 하기
    if (user1.partnerNo === undefined) throw new Error('파트너가 존재하지 않습니다');
    const user2 = await this.userSvc.getUser(user1.partnerNo);
    const endDate: Date = add(createChallengeDto.startDate, { days: TWOTWO });

    const challengeNo = await this.autoIncrement();
    const challenge = await this.challengeModel.create({
      challengeNo,
      name: createChallengeDto.name,
      user1: user1,
      user2: user2,
      startDate: createChallengeDto.startDate,
      endDate: endDate,
      user2Flower: createChallengeDto.user2Flower,
    });

    await challenge.save();
    return challenge;
  }

  async findChallenge(challengeNo: number): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findOne({ challengeNo });
    if (challenge === null) throw new Error('존재하지 않는 챌린지입니다');
    return challenge;
  }

  async findUserChallenges(userNo: number): Promise<ChallengeDocument[]> {
    const challenges = await this.challengeModel.find({
      $or: [{ 'user1.userNo': userNo }, { 'user2.userNo': userNo }],
    });
    return challenges;
  }

  async approveChallenge(challengeNo: number, user1Flower: string): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findOneAndUpdate(
      { challengeNo },
      { $set: { user1Flower, isApproved: true } },
    );
    if (challenge === null) throw new Error('존재하지 않는 챌린지입니다');
    return challenge;
  }

  async deleteChallenge(challengeNo: number): Promise<number> {
    await this.challengeModel.deleteOne({ challengeNo });
    return challengeNo;
  }

  private async autoIncrement() {
    let result: { count: number } | null = null;

    while (result === null) {
      result = await this.challengeCounterModel.findOneAndUpdate(
        { key: 'challengeNo' },
        { $inc: { count: 1 } },
        { upsert: true, returnOriginal: false },
      );
    }

    return result!.count;
  }
}
