export interface Recipe {
  id?: number;
  name: string;
  ingredients: string;
  instructions: string;
  difficulty: number;
  time_minutes: number;
  flavor: string;
  image_data: string;
  video_url: string;
  created_at?: string;
}
