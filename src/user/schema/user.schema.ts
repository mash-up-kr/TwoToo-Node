import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LoginType } from '../user.types';

@Schema({ collection: 'user', timestamps: true, versionKey: false })
export class User {
  @Prop()
  userNo!: number;

  @Prop()
  nickname!: string;

  @Prop()
  partnerNo?: number;

  @Prop()
  socialId!: string;

  @Prop({ type: String })
  loginType!: LoginType;

  @Prop()
  accessToken!: string;

  @Prop()
  deviceToken!: string;
}
export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
