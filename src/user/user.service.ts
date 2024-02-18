import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import { ChallengeService } from '../challenge/challenge.service';
import { UserInfoResDto } from './dto/user.dto';
import { LoggerService } from '../logger/logger.service';
import { Challenge, ChallengeDocument } from 'src/challenge/schema/challenge.schema';

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
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => ChallengeService))
    private challengeSvc: ChallengeService,
    private logger: LoggerService,
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

    this.logger.log(`Created user - user(${JSON.stringify(this.getPartialUserInfo(user))}})`);
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
      this.logger.debug(`Update user 닉네임 설정 완료`);
    } else {
      if (data.partnerNo === userNo) {
        throw new ConflictException('자기 자신과 파트너 매칭할 수 없습니다.');
      }
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

      // 서로 매칭 진행
      try {
        await Promise.all([
          this.userModel.findOneAndUpdate(
            { userNo: userNo },
            {
              $set: { nickname: data.nickname, partnerNo: data.partnerNo },
            },
            { new: true },
          ),
          this.userModel.findOneAndUpdate(
            { userNo: data.partnerNo },
            {
              $set: { partnerNo: userNo },
            },
          ),
        ]);

        updatedUser = await this.getUser(userNo);
        this.logger.debug(`Update user 닉네임 설정 및 파트너 매칭 완료`);
      } catch (err) {
        throw new NotFoundException('파트너 매칭에 실패했습니다.');
      }
    }

    this.logger.log(`Updated user - user(${JSON.stringify(this.getPartialUserInfo(user))}})`);
    return updatedUser as User;
  }

  async checkPartner(userNo: number): Promise<number | undefined> {
    const user = await this.getUser(userNo);
    this.logger.log(`Check partnerNo - userNo(${userNo}), parterNo(${user.partnerNo || 0})`);

    return user.partnerNo;
  }

  async getUser(userNo: number): Promise<UserDocument> {
    const user = (await this.userModel.findOne({ userNo: userNo })) as UserDocument;

    if (_.isNull(user)) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    this.logger.log(`Get User - user(${JSON.stringify(this.getPartialUserInfo(user))}})`);
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
        $set: { deviceToken: deviceToken },
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

  async delPartner(user: User): Promise<boolean> {
    const partnerNo = user.partnerNo;

    if (partnerNo === null) {
      throw new NotFoundException('파트너가 존재하지 않습니다.');
    }

    try {
      await this.userModel.updateMany(
        {
          userNo: { $in: [user.userNo, user.partnerNo] },
        },
        { $set: { nickname: null, partnerNo: null } },
      );

      this.logger.debug(`Delete Partner - userNo(${user.userNo}) partnerNo(${user.partnerNo})`);

      await this.challengeSvc.deleteAllChallenges(user.userNo);
      this.logger.log(`Delete all challenges - userNo(${user.userNo})`);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  async delUser(userNo: number): Promise<boolean> {
    const user = await this.userModel.findOneAndDelete({
      userNo: userNo,
    });

    if (_.isNull(user)) {
      throw new NotFoundException(`${userNo}의 삭제에 실패했습니다.`);
    }

    this.logger.log(`Delete User - userNo(${user.userNo})`);
    return true;
  }

  async changeUserNickname(userNo: number, nickname: string): Promise<UserInfoResDto> {
    const user = await this.userModel.findOneAndUpdate(
      { userNo: userNo },
      {
        $set: {
          nickname: nickname,
        },
      },
      { new: true },
    );

    try {
      await this.challengeModel.updateMany(
        { 'user1.userNo': userNo },
        {
          $set: {
            'user1.nickname': nickname,
          },
        },
      );

      await this.challengeModel.updateMany(
        { 'user2.userNo': userNo },
        {
          $set: {
            'user2.nickname': nickname,
          },
        },
      );
    } catch (e) {
      throw new NotFoundException(`${userNo}닉네임 변경에 실패했습니다.`);
    }

    if (_.isNull(user)) {
      throw new NotFoundException(`${userNo}닉네임 변경에 실패했습니다.`);
    }

    this.logger.log(
      `Changer User nickname - user(${JSON.stringify(this.getPartialUserInfo(user))}})`,
    );
    return {
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
    };
  }
}
