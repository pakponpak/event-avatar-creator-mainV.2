export interface Attendee {
  id: string;
  name: string;
  face_type: number;
  clothes_type: number;
  pants_type: number;
  hair_color: string;
  skin_color: string;
  face_photo_url: string | null;
  position_x: number;
  position_y: number;
  created_at: string;
  is_winner?: boolean;
  sprite_name?: string | null;
}

export interface CharacterCustomization {
  name: string;
  faceType: number;
  clothesType: number;
  pantsType: number;
  hairColor: string;
  skinColor: string;
  facePhotoUrl: string | null;
  spriteName?: string | null;
}
