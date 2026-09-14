import { api } from '@/lib/api';
import type { CursorPage, CursorParams, DataList, EntityId } from '@/types/api';
import type { Comment, CreateCommentInput } from '@/types/poll';
import { endpoints } from './endpoints';

export const commentService = {
  async listForPoll(pollId: EntityId, params: CursorParams): Promise<CursorPage<Comment>> {
    const { data } = await api.get<CursorPage<Comment>>(endpoints.comments.poll(pollId), { params });
    return data;
  },
  async listForOption(optionId: EntityId): Promise<DataList<Comment>> {
    const { data } = await api.get<DataList<Comment>>(endpoints.comments.option(optionId));
    return data;
  },
  async listReplies(commentId: EntityId): Promise<DataList<Comment>> {
    const { data } = await api.get<DataList<Comment>>(endpoints.comments.replies(commentId));
    return data;
  },
  async create(pollId: EntityId, input: CreateCommentInput): Promise<void> {
    await api.post<unknown>(endpoints.comments.poll(pollId), input);
  },
  async react(commentId: EntityId, type: string): Promise<void> {
    await api.post<unknown>(endpoints.comments.reaction(commentId), { type });
  },
  async removeReaction(commentId: EntityId): Promise<void> {
    await api.delete<unknown>(endpoints.comments.reaction(commentId));
  },
};
