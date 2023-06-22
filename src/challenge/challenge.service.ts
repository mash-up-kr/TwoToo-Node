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

  async createChallenge(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
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
