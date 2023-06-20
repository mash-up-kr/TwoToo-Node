import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'commit', timestamps: true })
export class Commit {
  @Prop()
  commitNo: number;

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
}

export type CommitDocument = HydratedDocument<Commit>;

export const CommitSchema = SchemaFactory.createForClass(Commit);
