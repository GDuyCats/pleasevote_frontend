export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface FullProfile extends User {
  avatar_url: string | null;
  coin_balance: number;
  email_verified: boolean;
  created_at: string;
}

export interface UpdateProfileInput {
  name: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}
