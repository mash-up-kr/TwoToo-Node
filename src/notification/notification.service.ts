import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import * as FirebaseAdmin from 'firebase-admin';

import { PushResDto } from './dto/notification.dto';
import { Notification, NotificationDocument } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificaitonModel: Model<NotificationDocument>,
  ) { }
  async getStingCount(userNo: number): Promise<number> {
    const today = moment().tz('Asia/Seoul').startOf('day').toDate();

    const ret = await this.notificaitonModel
      .findOne({
        userNo: userNo,
        createdAt: {
          $gte: today,
        },
      })
      .count();
    return ret;
  }

  async sendPush({ deviceToken, title, message }: PushResDto): Promise<string> {
    const sendMessage = {
      token: deviceToken,
      notification: {
        title,
        message,
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
