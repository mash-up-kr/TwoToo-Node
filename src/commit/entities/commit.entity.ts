import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId,Schema as MongooseSchema } from 'mongoose';


//?는 Optional !는 값이 있다고 생각하게 하는거
@Schema()
export class Commit extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  challengeId!: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId!: ObjectId

  @Prop({ type: String})
  imageUrl?: string;

  @Prop({ type: String})
  commitMessage?: string;

  @Prop({ type: Boolean, required: true, default: true })
  isDeleted!: boolean;

  @Prop({type: String})
  partnerComplement?: string;
}

export const CommitEntitySchema = SchemaFactory.createForClass(Commit);