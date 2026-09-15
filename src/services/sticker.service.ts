import { api } from '@/lib/api';
import type { EntityId } from '@/types/api';
import type { CreateStickerInput, SlotStatus, Sticker, StickerPack } from '@/types/sticker';
import { endpoints } from './endpoints';

export const stickerService = {
  async list(): Promise<Sticker[]> {
    const { data } = await api.get<Sticker[]>(endpoints.stickers.list);
    return data;
  },
  async listPacks(): Promise<StickerPack[]> {
    const { data } = await api.get<StickerPack[]>(endpoints.stickerPacks.list);
    return data;
  },
  async listMine(): Promise<Sticker[]> {
    const { data } = await api.get<Sticker[]>(endpoints.stickers.mine);
    return data;
  },
  async purchase(stickerId: EntityId): Promise<void> {
    await api.post<unknown>(endpoints.stickers.purchase(stickerId));
  },
  async purchasePack(packId: EntityId): Promise<void> {
    await api.post<unknown>(endpoints.stickerPacks.purchase(packId));
  },
  async getSlotStatus(): Promise<SlotStatus> {
    const { data } = await api.get<SlotStatus>(endpoints.stickers.slotStatus);
    return data;
  },
  async purchaseSlots(): Promise<void> {
    await api.post<unknown>(endpoints.stickers.purchaseSlots);
  },
  async create(input: CreateStickerInput): Promise<void> {
    const formData = new FormData();
    formData.append('name', input.name);
    formData.append('price_coins', String(input.price_coins));
    formData.append('image', input.image);
    await api.post<unknown>(endpoints.stickers.list, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
