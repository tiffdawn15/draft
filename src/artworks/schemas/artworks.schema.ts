// {
//     "id": 2,
//     "api_model": "artwork-types",
//     "api_link": "https://api.artic.edu/api/v1/artwork-types/2",
//     "title": "Photograph",
//     "aat_id": 300046300,
//     "source_updated_at": "2019-05-08T19:03:58-05:00",
//     "updated_at": "2022-03-15T16:31:39-05:00",
//     "timestamp": "2025-02-16T02:10:52-06:00"
// }

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
}

export const ArtSchema = SchemaFactory.createForClass(Art);
