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
    private readonly userModel: Model<UserDocument>
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

  async setNickname({ userId, data }) {
    const user = await this.userModel.findOne({ _id: userId });

    if (!user) {
      throw new Error('User Not Found');
    }

    // TODO: nickname validation
    if (!data.nickname) {
      throw new Error('Invalid nickname.');
    }

    if (user.partnerId) {
      throw new Error('Partner already matched!');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { nickname: data.nickname, ...(data.partnerId && { partnerId: data.parterId }) } }
    ).exec();

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
    }

    return state;
  }
}