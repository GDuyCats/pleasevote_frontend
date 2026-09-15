export interface StickerCreator {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Sticker {
  id: number;
  creator_id: number;
  creator: StickerCreator;
  name: string;
  image_url: string;
  price_coins: number;
  is_active: boolean;
  created_at: string;
}

export interface StickerPack {
  id: number;
  creator_id: number;
  creator: StickerCreator;
  name: string;
  description: string | null;
  price_coins: number;
  stickers: Sticker[];
  is_active: boolean;
  created_at: string;
}

export interface SlotStatus {
  used: number;
  limit: number;
  slotPackSize: number;
  slotPackPriceCoins: number;
}
export interface CreateStickerInput {
  name: string;
  price_coins: string | number;
  image: File;
}
