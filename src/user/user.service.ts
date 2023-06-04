import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) { }

  async createUser() {
    const userNo = 0; // auto-increment 적용?
    const user = await this.userModel.create({ userNo });

    await user.save();
    return user;
  }

  async updateUser({ userNo, nickname, partnerNo }) {
    const user = await this.userModel.findOne({ userNo });

    if (!user) {
      throw new Error('Not Found User');
    }

    if (user.partnerNo) {
      throw new Error('Partner already exists.');
    }

    user.nickname = nickname;
    user.partnerNo = partnerNo;

    await user.save();
    return user;
  }

  async me(userNo: number) {
    const user = await this.userModel.findOne({ userNo });
    if (!user) {
      throw new Error('Not Found User');
    }

    return user;
  }
}