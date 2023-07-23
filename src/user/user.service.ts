import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    if (!_.isNull(user.partnerNo)) {
      throw new ConflictException('현재 유저는 이미 파트너 매칭이 완료되었습니다.');
    }

    let updatedUser = null;
    if (!_.has(data, 'partnerNo')) {
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
      if (_.isNull(data.partnerNo)) {
        throw new BadRequestException('닉네임 설정 및 파트너 매칭에는 파트너 번호가 필요합니다.');
      }

      const partnerUserInfo = await this.getUser(data.partnerNo);

      if (_.isNull(partnerUserInfo)) {
        throw new NotFoundException('해당 유저가 존재하지 않습니다. 매칭할 수 없습니다.');
      }

      if (_.isNull(partnerUserInfo.nickname)) {
        throw new ConflictException('닉네임이 설정되지않은 유저와 매칭할 수 없습니다.');
      }

      if (!_.isNull(partnerUserInfo.partnerNo)) {
        throw new ConflictException('매칭하고자하는 유저가 이미 파트너 매칭이 완료되었습니다.');
      }

      updatedUser = await this.userModel.findOneAndUpdate(
        { userNo: userNo },
        {
          $set: { nickname: data.nickname, partnerNo: data.partnerNo },
        },
        { new: true },
      );
    }

    if (_.isNull(updatedUser)) {
      throw new NotFoundException('닉네임 설정 혹은 파트너 매칭에 실패했습니다.');
    }

    return updatedUser as User;
  }

  async checkPartner(userNo: number): Promise<number> {
    const user = await this.getUser(userNo);

    return user.partnerNo || 0;
  }

  async getUser(userNo: number): Promise<UserDocument> {
    const user = (await this.userModel.findOne({ userNo: userNo })) as UserDocument;

    if (_.isNull(user)) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
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

  private async autoIncrement(key: string): Promise<number> {
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

  async getPartnerDeviceToken(userNo: number): Promise<string> {
    const ret = await this.userModel
      .findOne({ partnerNo: userNo }, { _id: 0, deviceToken: 1 })
      .lean();

    if (_.isNull(ret)) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    const partnerDeviceToken = ret ? ret.deviceToken : null;

    if (_.isNull(partnerDeviceToken)) {
      throw new NotFoundException('deviceToken이 존재하지 않습니다.');
    }

    return partnerDeviceToken as string;
  }

  async updateDeviceToken({
    userNo,
    deviceToken,
  }: {
    deviceToken: string;
    userNo: number;
  }): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { userNo: userNo },
      {
        deviceToken: deviceToken,
      },
      { new: true },
    );

    return updatedUser as User;
  }

  getPartialUserInfo(user: User): Pick<User, 'nickname' | 'userNo' | 'partnerNo'> {
    // 민감하지않은 정보들만 추출
    const { userNo, nickname, partnerNo } = user;

    return { userNo, nickname, partnerNo };
  }
}
