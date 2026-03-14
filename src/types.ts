export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'Free' | 'Pro' | 'Admin';
  created_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  prompt: string;
  generated_idea: string;
  created_at: string;
  is_favorite?: boolean;
}
