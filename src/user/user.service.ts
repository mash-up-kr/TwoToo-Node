import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import _ from 'lodash';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from './schema/user.schema';

enum LOGIN_STAT {
  'NEED_NICKNAME',
  'NEED_MATCHING',
  'HOME'
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserCounter.name)
    private readonly userCounterModel: Model<UserCounterDocument>
  ) { }

  async signUp() {
    const user = await this.userModel.create({
      nickname: null,
      partnerId: null,
    });

    // TODO: accessToken 발급
    const accessToken = '';
    await user.save();
    return [user, accessToken] as const;
  }

  async signIn(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });

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

  async checkPartner(userId: string): Promise<Types.ObjectId | null> {
    const user = await this.me(userId);

    return user.partnerId;
  }

  async me(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new Error('Not Found User');
    }

    return user;
  }

  async checkCurrentLoginState(userId: string): Promise<LOGIN_STAT> {
    const user = await this.me(userId);

    let state: LOGIN_STAT = null;
    if (user.nickname && user.partnerId) {
      state = LOGIN_STAT.HOME;
    } else {
      if (!_.isNil(user.nickname)) {
        state = LOGIN_STAT.NEED_NICKNAME;
      }

      if (!_.isNil(user.partnerId)) {
        state = LOGIN_STAT.NEED_MATCHING;
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