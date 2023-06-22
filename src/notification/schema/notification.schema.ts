import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'notification' })
export class Notification {
  @Prop()
  message!: string;

  @Prop()
  userNo!: number;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
