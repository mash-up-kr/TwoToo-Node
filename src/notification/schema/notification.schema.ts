import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotificaitonType } from '../dto/notification.dto';

@Schema({ collection: 'notification', timestamps: true, versionKey: false })
export class Notification {
  @Prop()
  message!: string;

  @Prop()
  userNo!: number;

  @Prop()
  challengeNo!: number;

  @Prop()
  notificationType!: NotificaitonType;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
