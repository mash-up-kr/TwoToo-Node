import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserSchema } from '../../user/schema/user.schema';
import { FlowerType } from '../dto/challenge.dto';

@Schema({ collection: 'challenge', timestamps: true, versionKey: false })
export class Challenge {
  @Prop()
  challengeNo!: number;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: UserSchema })
  user1: User; // 챌린지 생성자

  @Prop({ type: UserSchema })
  user2: User; // 챌린지 수락자

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: 0 })
  user1CommitCnt: number;

  @Prop({ default: 0 })
  user2CommitCnt: number;

  @Prop({ type: String, default: '' })
  user1Flower: FlowerType;

  @Prop({ type: String })
  user2Flower: FlowerType;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: false })
  isFinished: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export type ChallengeDocument = HydratedDocument<Challenge>;

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
