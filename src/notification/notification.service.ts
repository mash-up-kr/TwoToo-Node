import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './schema/notification.schema';
import {
  NotificationCounter,
  NotificationCounterDocument,
} from './schema/notification-counter.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificaitonModel: Model<NotificationDocument>,
    @InjectModel(NotificationCounter.name)
    private readonly NotificationCounterModel: Model<NotificationCounterDocument>,
  ) {}
  async getStingCount({ userNo }: { userNo: number }): Promise<any> {
    const ret = await this.notificaitonModel.findOne({ userNo: userNo }).count();
    return ret;
  }
  sendPush({ message, firebaseToken }: { message: string; firebaseToken: string }) {
    return 'This action send Push ';
  }

  createSting({ message, userNo }: { message: string; userNo: number }) {
    return `This action store Sting`;
  }
}
