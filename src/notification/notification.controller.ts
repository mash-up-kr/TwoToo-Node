import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/push/:firebaseToken')
  @ApiOperation({
    description: 'push알림을 보냅니다. 데이터베이스에 따로 저장을 하지는 않습니다.',
  })
  async push(@Body() message: string, @Param('firebaseToken') fireBaseToken: string) {
    return await this.notificationService.sendPush();
  }

  @Post('/sting/:firebaseToekn')
  @ApiOperation({
    description: '찌르기를 했을 때 DB에 저장하고 push알림을 상대에게 보냅니다.',
  })
  async sting(@Body() message: string, @Param('firebaseToken') fireBaseToken: string) {
    const pushRet = await this.notificationService.sendPush();
    if(pushRet) {
      return await this.notificationService.sendPush();
    }
    return false;
  }
}
