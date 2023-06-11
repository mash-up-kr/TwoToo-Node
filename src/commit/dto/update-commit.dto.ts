import { ObjectId } from 'mongoose';

export class UpdateCommitDto {
  challengeId?: ObjectId;
  userId?: ObjectId;
  imageUrl?: string;
  commitMessage?: string;
  isDeleted?: boolean;
  partnerComplement?: string;
}
