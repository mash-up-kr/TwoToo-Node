import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'commit', timestamps: true, versionKey: false })
export class Commit {
  @Prop()
  commitNo: number;

  @Prop()
  challengeNo: number;

  @Prop()
  userNo: number;

  @Prop()
  text: string;

  @Prop()
  photoUrl: string;

  @Prop()
  partnerComment: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export type CommitDocument = Commit & Document;

export const CommitSchema = SchemaFactory.createForClass(Commit);
