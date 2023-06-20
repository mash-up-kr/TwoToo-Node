import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

@Schema({ collection: 'challenge', timestamps: true })
export class Challenge {
  @Prop()
  challengeNo: number;

  @Prop()
  isApproved: boolean;

  @Prop()
  isFinished: boolean;

  @Prop()
  user1: User;

  @Prop()
  user2: User;

  @Prop()
  name: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  user1CommitCount: number;

  @Prop()
  user2CommitCount: number;

  // TODO: flower type 변경
  @Prop()
  user1Flower: string;

  @Prop()
  user2Flower: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type ChallengeDocument = Challenge & Document;

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
