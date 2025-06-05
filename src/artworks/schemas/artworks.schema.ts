import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArtDocument = HydratedDocument<Art>;

@Schema()
export class Art {
  @Prop()
  id: number;
  @Prop({ required: true })
  title: string;
  @Prop()
  api_link: string;
  @Prop()
  artwork_type_title?: string;
  @Prop()
  image_id?: number;
  @Prop()
  artist_display?: string;
  @Prop()
  artist_id?: number;
  @Prop()
  department_title?: string;
  @Prop()
  publication_history?: string;
  @Prop()
  provenance_text?: string;
  @Prop()
  updated_at?: Date;
}

export const ArtSchema = SchemaFactory.createForClass(Art);
