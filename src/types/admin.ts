import type { User } from './user';

export interface AdminUser extends User {
  is_locked: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface AdminStats {
  users: { total: number; admins: number; staff: number; verified: number; locked: number; newToday: number; newThisWeek: number };
  polls: { total: number; public: number; private: number; closed: number };
  engagement: { totalVotes: number; totalComments: number; totalReactions: number };
  moderation: { pendingReports: number; pendingAppeals: number };
  revenue: { byCurrency: { currency: string; totalCents: number; transactionCount: number }[]; coinsInCirculation: number };
  marketplace: { totalStickers: number; totalStickerPurchases: number };
}
