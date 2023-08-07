import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as FirebaseAdmin from 'firebase-admin';

import { PushResDto } from './dto/notification.dto';
import { Notification, NotificationDocument } from './schema/notification.schema';
import { endOfToday, startOfToday } from 'date-fns';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificaitonModel: Model<NotificationDocument>,
  ) {}
  async getStingCount(userNo: number): Promise<number> {
    const ret = await this.notificaitonModel
      .findOne({
        userNo: userNo,
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
    const notification = await this.notificaitonModel.create({
      message: message,
      userNo: userNo,
    });

    await notification.save();
    return notification;
  }
}
