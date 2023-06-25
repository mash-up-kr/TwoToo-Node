import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './schema/notification.schema';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import * as FirebaseAdmin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificaitonModel: Model<NotificationDocument>,
  ) {}
  async getStingCount({ userNo }: { userNo: number }): Promise<any> {
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

  async sendPush({
    deviceToken,
    title,
    message,
  }: {
    deviceToken: string;
    title: string;
    message: string;
  }): Promise<string> {
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

  async createSting({ message, userNo }: { message: string; userNo: number }) {
    const notification = await this.notificaitonModel.create({
      message: message,
      userNo: userNo,
    });

    await notification.save();
    return notification;
  }
}
