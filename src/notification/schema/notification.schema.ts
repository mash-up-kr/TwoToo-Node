import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'notification', timestamps: true })
export class Notification {
  @Prop()
  message!: string;

  @Prop()
  userNo!: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
