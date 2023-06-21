import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge, ChallengeDocument } from './schema/challenge.schema';
import { Model } from 'mongoose';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UserService } from '../user/user.service';
import { add } from 'date-fns';
import { TWOTWO } from '../constants/number';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly userSvc: UserService,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
  ) {}

  async createChallenge(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const user1 = await this.userSvc.getUser(createChallengeDto.user1No);
    const user2 = await this.userSvc.getUser(user1.partnerNo);
    const endDate: Date = add(createChallengeDto.startDate, { days: TWOTWO });

    const challenge = await this.challengeModel.create({
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
}
