import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  sendPush() {
    return 'This action send Push ';
  }

  createSting() {
    return `This action store Sting`;
  }
}
