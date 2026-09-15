import { api } from '@/lib/api';
import type { CursorPage, CursorParams, EntityId } from '@/types/api';
import type { CreatePollInput, Poll, PollDetail } from '@/types/poll';
import { endpoints } from './endpoints';

export const pollService = {
  async list(params: CursorParams): Promise<CursorPage<Poll>> {
    const { data } = await api.get<CursorPage<Poll>>(endpoints.polls.list, { params });
    return data;
  },
  async getById(pollId: EntityId): Promise<PollDetail> {
    const { data } = await api.get<PollDetail>(endpoints.polls.detail(pollId));
    return data;
  },
  async create(input: CreatePollInput): Promise<void> {
    const formData = new FormData();
    formData.append('question', input.question);
    formData.append('type', input.type);
    formData.append('visibility', input.visibility);
    formData.append('allow_user_options', String(input.allow_user_options));
    formData.append('options', JSON.stringify(input.options));
    await api.post<unknown>(endpoints.polls.list, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  async vote(pollId: EntityId, optionId: number): Promise<void> {
    await api.post<unknown>(endpoints.polls.vote(pollId), { poll_option_id: optionId });
  },
  async addOption(pollId: EntityId, label: string): Promise<void> {
    await api.post<unknown>(endpoints.polls.options(pollId), { label });
  },
  async react(pollId: EntityId, type: string): Promise<void> {
    await api.post<unknown>(endpoints.polls.reaction(pollId), { type });
  },
  async removeReaction(pollId: EntityId): Promise<void> {
    await api.delete<unknown>(endpoints.polls.reaction(pollId));
  },
  async reactToOption(optionId: EntityId, type: string): Promise<void> {
    await api.post<unknown>(endpoints.polls.optionReaction(optionId), { type });
  },
  async removeOptionReaction(optionId: EntityId): Promise<void> {
    await api.delete<unknown>(endpoints.polls.optionReaction(optionId));
  },
};
