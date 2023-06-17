import { ObjectId } from 'mongoose';

export class CreateCommitDto {
  challengeId?: ObjectId;
  userId?: ObjectId;
  imageUrl?: string;
  commitMessage?: string;
  isDeleted?: boolean;
  partnerComplement?: string;
}
