export class ArtworksDto {
  id: string;
  title: string;
  description?: string;
  api_link?: string; 
  image_id?: string;
  artist?: string;
  artist_display?: string;
  artwork_type_title?: string;
  category_titles?: string;
  date_end?: Date;
  department_title?: string;
  medium_display?: string;
  placeOfOrigin?: string;
  provenance_text?: string;
  artist_id?: number;
}
