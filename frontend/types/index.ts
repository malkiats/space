export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: "bearer";
}

export interface Note {
  id: string;
  title: string;
  content?: string | null;
  tags: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  owner_id: string;
  created_at: string;
}
