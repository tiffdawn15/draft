import mongoose from 'mongoose';

export class ArtDTO {
  _id: mongoose.Schema.Types.ObjectId;
  id: number;
  title: string;
  description?: string;
  image_id?: string;
  artist_display: string;
  artwork_type_title?: string;
  artist_id?: number;
  department_title?: string;
  publication_history?: string;
  provenance_text?: string;
}
