import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export abstract class AbstractDocument {
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export type AbstractDocumentType = AbstractDocument & Document;
