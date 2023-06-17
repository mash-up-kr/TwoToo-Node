import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'commit' })
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
}
export type CommitDocument = Commit & Document;

export const CommitSchema = SchemaFactory.createForClass(Commit);
