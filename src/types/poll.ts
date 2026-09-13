export interface ReactionBreakdown {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  gif: number;
  sticker: number;
}

export interface PollOption {
  id: number;
  label: string;
  description: string | null;
  voteCount: number;
  reactions?: ReactionBreakdown;
  myReaction?: string | null;
  commentCount?: number;
}

export interface PollAuthor {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Poll {
  id: number;
  question: string;
  type: 'single_choice' | 'multiple_choice';
  visibility: 'public' | 'private' | 'group';
  background_image: string | null;
  author: PollAuthor;
  options: PollOption[];
  isClosed: boolean;
  created_at: string;
  reactions: ReactionBreakdown;
  myReaction: string | null;
  totalCommentCount?: number;
  allow_user_options: boolean;
}

export interface PollDetail extends Poll {
  totalCommentCount: number;
}

export interface CommentUser {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Comment {
  id: number;
  content: string | null;
  gif_url: string | null;
  user: CommentUser;
  reactions: ReactionBreakdown;
  totalReactions: number;
  replyCount: number;
  created_at: string;
  myReaction: string | null;
}