import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import _ from 'lodash';
import { Model } from 'mongoose';

import { User, UserDocument } from './schema/user.schema';
import { UserCounter, UserCounterDocument } from './schema/user-counter.schema';

export type LOGIN_STATE = 'NEED_NICKNAME' | 'NEED_MATCHING' | 'HOME'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserCounter.name)
    private readonly userCounterModel: Model<UserCounterDocument>
  ) { }

  async signUp() {
    const userNo = await this.autoIncrement('userNo');
    const user = await this.userModel.create({
      userNo,
      nickname: null,
      partnerNo: null,
    });

    // TODO: accessToken 발급
    const accessToken = '';
    await user.save();
    return [user, accessToken] as const;
  }

  async signIn(userNo: number) {
    const user = await this.userModel.findOne({ userNo: userNo }).lean();

    return user;
  }

  async setNicknameAndPartner({ userNo, data }) {
    console.log('setNicknameAndPartner')
    const user = await this.getUser(userNo);

    // TODO: nickname validation
    if (!_.has(data, 'nickname')) {
      throw new Error('Nickname does not exists! Invalid Nickname');
    }

    if (user.partnerNo) {
      throw new Error('Partner already matched!');
    }

    let updatedUser = null;
    if (data.partnerNo) {
      console.log('partnerNo exists. Matching is needed');
      updatedUser = await this.userModel.findOneAndUpdate(
        { userNo: userNo },
        {
          $set: { nickname: data.nickname, partnerNo: data.partnerNo }
        },
        { new: true }
      );

      await this.userModel.findOneAndUpdate(
        { userNo: data.partnerNo },
        { $set: { partnerNo: userNo } });

      console.log(`matched each other - 요청한 사람: ${data.partnerNo}, 수락한 사람: ${userNo}`);
    } else {
      console.log('partnerNo does not exist. Only set nickname.');
      updatedUser = await this.userModel.findOneAndUpdate(
        { userNo: userNo },
        { $set: { nickname: data.nickname } },
        { new: true }
      );
    }

    return updatedUser;
  }

  async checkPartner(userNo: string): Promise<number | null> {
    const user = await this.getUser(userNo);

    return user.partnerNo;
  }

  async getUser(userNo: string): Promise<User> {
    const user = await this.userModel.findOne({ userNo: userNo }).lean();
    if (!user) {
      throw new Error('Not Found User');
    }

    return user;
  }

  async checkCurrentLoginState(user: User): Promise<LOGIN_STATE> {
    let state: LOGIN_STATE = null;
    if (user?.nickname && user?.partnerNo) {
      console.log(`nickname O, partnerNo O: ${user.nickname}, ${user.partnerNo}`);
      state = 'HOME';
    } else if (_.isNull(user?.nickname)) {
      console.log(`nickname X`);
      state = 'NEED_NICKNAME';
    } else {
      console.log(`partnerNo X`);
      state = 'NEED_MATCHING';
    }

    return state;
  }

  private async autoIncrement(key: string) {
    let result: { count: number } | null = null;

    while (result === null) {
      result = await this.userCounterModel.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { upsert: true, returnOriginal: false }
      );
    }

    return result!.count;
  }
}