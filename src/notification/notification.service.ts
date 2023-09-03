import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as FirebaseAdmin from 'firebase-admin';

import { PushResDto } from './dto/notification.dto';
import { Notification, NotificationDocument } from './schema/notification.schema';
import { endOfToday, startOfToday } from 'date-fns';
import { ChallengeService } from '../challenge/challenge.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificaitonModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => ChallengeService))
    private readonly challengeService: ChallengeService,
  ) {}
  async getStingCount(userNo: number): Promise<number> {
    const recentChallenge = await this.challengeService.findRecentChallenge(userNo);
    if (recentChallenge == null || recentChallenge.isDeleted)
      throw new NotFoundException('챌린지가 존재하지 않습니다.');

    const ret = await this.notificaitonModel
      .findOne({
        userNo: userNo,
        challengeNo: recentChallenge.challengeNo,
        createdAt: { $gte: startOfToday(), $lte: endOfToday() },
      })
      .count();
    return ret;
  }

  async sendPush({ deviceToken, message, nickname }: PushResDto): Promise<string> {
    const sendMessage = {
      token: deviceToken,
      data: {
        title: nickname,
        body: message,
      },
      notification: {
        title: nickname,
        body: message,
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
    };
    const ret = await FirebaseAdmin.messaging().send(sendMessage);
    return ret;
  }

  async sendPushAndroid({ deviceToken, message, nickname }: PushResDto): Promise<string> {
    const sendMessage = {
      token: deviceToken,
      data: {
        title: nickname,
        body: message,
      },
    };
    const ret = await FirebaseAdmin.messaging().send(sendMessage);
    return ret;
  }

  async createSting({
    message,
    userNo,
  }: {
    message: string;
    userNo: number;
  }): Promise<Notification> {
    const recentChallenge = await this.challengeService.findRecentChallenge(userNo);
    if (recentChallenge == null) throw new BadRequestException('챌린지가 존재하지 않습니다.');

    const notification = await this.notificaitonModel.create({
      challengeNo: recentChallenge.challengeNo,
      message: message,
      userNo: userNo,
    });

    await notification.save();
    return notification;
  }
}
