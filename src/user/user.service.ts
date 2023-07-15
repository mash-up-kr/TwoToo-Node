import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';

import { User, UserDocument } from './schema/user.schema';
import { UserCounter, UserCounterDocument } from './schema/user-counter.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/auth.types';
import { LoginType } from './user.types';

export enum LOGIN_STATE {
  NEED_NICKNAME = 'NEED_NICKNAME',
  NEED_MATCHING = 'NEED_MATCHING',
  HOME = 'HOME',
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserCounter.name)
    private readonly userCounterModel: Model<UserCounterDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp({
    socialId,
    loginType,
    deviceToken,
  }: {
    socialId: string;
    loginType: LoginType;
    deviceToken: string;
  }) {
    const userNo = await this.autoIncrement('userNo');
    const payload: JwtPayload = { userNo: userNo, socialId: socialId, loginType: loginType };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    const user = await this.userModel.create({
      userNo,
      nickname: null,
      partnerNo: null,
      socialId: socialId,
      loginType: loginType,
      accessToken: accessToken,
      deviceToken: deviceToken,
    });

    await user.save();
    return user;
  }

  async setNicknameAndPartner({ userNo, data }: { userNo: number; data: any }): Promise<User> {
    const user = await this.getUser(userNo);

    if (!_.has(data, 'nickname')) {
      throw new Error('nickname 필드가 필요합니다.');
    }

    if (!_.has(data, 'partnerNo')) {
      throw new Error('partnerNo 필드가 필요합니다.');
    }

    if (!_.isNull(user.partnerNo)) {
      throw new Error('현재 유저는 이미 파트너 매칭이 완료되었습니다.');
    }

    let updatedUser = null;
    if (_.isNull(data.partnerNo)) {
      // 닉네임만 설정하는 경우(초대자)
      updatedUser = await this.userModel.findOneAndUpdate(
        { userNo: userNo },
        {
          $set: { nickname: data.nickname },
        },
        { new: true },
      );
    } else {
      // 닉네임 설정 및 파트너 매칭(초대받은자)
      try {
        const partnerUserInfo = await this.getUser(data.partnerNo);
        if (_.isNull(partnerUserInfo.nickname)) {
          throw new Error('닉네임이 설정되지않은 유저와 매칭할 수 없습니다.');
        }

        if (!_.isNull(partnerUserInfo.partnerNo)) {
          throw new Error('매칭하고자하는 유저가 이미 파트너 매칭이 완료되었습니다.');
        }

        updatedUser = await this.userModel.findOneAndUpdate(
          { userNo: userNo },
          {
            $set: { nickname: data.nickname, partnerNo: data.partnerNo },
          },
          { new: true },
        );
      } catch (err) {
        // partnerNo에 해당하는 유저 없음
        throw new Error('해당 유저가 존재하지 않습니다. 매칭할 수 없습니다.');
      }
    }

    if (_.isNull(updatedUser)) {
      throw new Error('Not Found User - failed to update user');
    }

    return updatedUser;
  }

  async checkPartner(userNo: number): Promise<number> {
    const user = await this.getUser(userNo);

    return user.partnerNo || 0;
  }

  async getUser(userNo: number): Promise<User> {
    const user = await this.userModel.findOne({ userNo: userNo }).lean();
    if (!user) {
      throw new Error('Not Found User');
    }

    return user;
  }

  async checkCurrentLoginState(user: User): Promise<LOGIN_STATE> {
    let state: LOGIN_STATE = LOGIN_STATE.NEED_NICKNAME;
    if (user?.nickname && user?.partnerNo) {
      state = LOGIN_STATE.HOME;
    } else if (_.isNull(user?.nickname)) {
      state = LOGIN_STATE.NEED_NICKNAME;
    } else {
      state = LOGIN_STATE.NEED_MATCHING;
    }

    return state;
  }

  private async autoIncrement(key: string) {
    let result: { count: number } | null = null;

    while (result === null) {
      result = await this.userCounterModel.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { upsert: true, returnOriginal: false },
      );
    }

    return result!.count;
  }

  async getUserBySocialIdAndLoginType(
    socialId: string,
    loginType: LoginType,
  ): Promise<User | null> {
    return await this.userModel.findOne({ socialId: socialId, loginType: loginType });
  }

  async getPartnerDeviceToken(userNo: number) {
    const ret = await this.userModel.findOne({ partnerNo: userNo }, { _id: 0, deviceToken: 1 });
    if (_.isNil(ret)) {
      throw new Error('No Partner');
    }
    if (_.isNil(ret.deviceToken)) {
      throw new Error('No deviceToken');
    }
    return ret!.deviceToken;
  }

  async updateDeviceToken({ userNo, deviceToken }: { deviceToken: string; userNo: number }) {
    if (_.isNil(deviceToken)) {
      throw new Error('No deviceToken');
    }
    const ret = await this.userModel.findOneAndUpdate(
      { userNo: userNo },
      {
        deviceToken: deviceToken,
      },
    );

    return ret;
  }
}
