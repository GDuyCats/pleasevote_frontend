'use client';

import { useState } from 'react';
import { Comment } from '@/types/poll';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ReactionButton from '@/components/ReactionButton';
import { formatRelativeTime } from '@/lib/formatTime';
import { useAuthPrompt } from '@/context/AuthPromptContext';

const MAX_VISUAL_DEPTH = 2;

interface FlatItem {
  comment: Comment;
  visualDepth: number; // 1 = first indent level, 2 = max indent level
  replyingToName: string;
}

function CommentRow({
  comment,
  pollAuthorId,
  replyingToName,
  onReacted,
  onReplyPosted,
}: {
  comment: Comment;
  pollAuthorId: number;
  replyingToName?: string;
  onReacted: (id: number, type: string | null) => void;
  onReplyPosted: () => void;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const { openPrompt } = useAuthPrompt();

  const isAuthor = comment.user.id === pollAuthorId;

  async function handleReact(type: string) {
    if (!user) {
      openPrompt();
      return;
    }
    onReacted(comment.id, type);
    try {
      await api.post(`/comments/${comment.id}/react`, { type });
    } catch {
      // leave optimistic state
    }
  }

  async function handleRemoveReact() {
    if (!user) return;
    onReacted(comment.id, null);
    try {
      await api.delete(`/comments/${comment.id}/react`);
    } catch {
      // no-op
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      openPrompt();
      return;
    }
    if (!replyText.trim()) return;

    const pollIdMatch = window.location.pathname.match(/\/polls\/(\d+)/);
    const pollId = pollIdMatch ? pollIdMatch[1] : null;
    if (!pollId) return;

    await api.post(`/comments/polls/${pollId}`, {
      content: replyText,
      parent_id: comment.id,
    });

    setReplyText('');
    setShowReplyBox(false);
    onReplyPosted();
  }

  return (
    <div className="flex gap-2">
      {comment.user.avatar_url ? (
        <img src={comment.user.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
          {comment.user.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1">
        <div className="rounded-2xl bg-gray-100 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-800">{comment.user.name}</p>
            {isAuthor && (
              <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600">
                Tác giả
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">
            {replyingToName && <span className="mr-1 font-medium text-purple-600">@{replyingToName}</span>}
            {comment.content}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-3 pl-3 text-xs text-gray-500">
          <span>{formatRelativeTime(comment.created_at)}</span>
          <ReactionButton
            count={comment.totalReactions}
            myReaction={comment.myReaction}
            onReact={handleReact}
            onRemove={handleRemoveReact}
            size="sm"
          />
          <button onClick={() => setShowReplyBox((v) => !v)} className="font-medium hover:underline">
            Phản hồi
          </button>
        </div>

        {showReplyBox && (
          <form onSubmit={handleSubmitReply} className="mt-2 flex gap-2 pl-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết phản hồi..."
              className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm focus:border-purple-400 focus:outline-none"
            />
            <button type="submit" className="text-sm font-medium text-purple-600">
              Gửi
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CommentItem({ comment: initial, pollAuthorId }: { comment: Comment; pollAuthorId: number }) {
  const [comment, setComment] = useState(initial);
  const [flatItems, setFlatItems] = useState<FlatItem[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedParentIds, setLoadedParentIds] = useState<Set<number>>(new Set());

  function updateReactionOn(list: FlatItem[], targetId: number, newType: string | null): FlatItem[] {
    return list.map((item) => {
      if (item.comment.id !== targetId) return item;
      return { ...item, comment: applyReaction(item.comment, newType) };
    });
  }

  function applyReaction(c: Comment, newType: string | null): Comment {
    const updatedReactions = { ...c.reactions };
    const oldType = c.myReaction;
    if (oldType) {
      updatedReactions[oldType as keyof typeof updatedReactions] = Math.max(
        0,
        updatedReactions[oldType as keyof typeof updatedReactions] - 1
      );
    }
    if (newType) {
      updatedReactions[newType as keyof typeof updatedReactions] =
        (updatedReactions[newType as keyof typeof updatedReactions] || 0) + 1;
    }
    const newTotal = Object.entries(updatedReactions)
      .filter(([key]) => key !== 'gif' && key !== 'sticker')
      .reduce((sum, [, c2]) => sum + c2, 0);
    return { ...c, reactions: updatedReactions, myReaction: newType, totalReactions: newTotal };
  }

  function handleRootReacted(id: number, type: string | null) {
    setComment((prev) => applyReaction(prev, type));
  }

  function handleFlatReacted(id: number, type: string | null) {
    setFlatItems((prev) => updateReactionOn(prev, id, type));
  }

  // Fetches direct children of `parentId` and inserts them right after the
  // parent's position in the flat array, so nested replies still appear
  // visually grouped under the comment they belong to — while their
  // indentation is capped at MAX_VISUAL_DEPTH regardless of true depth.
  async function loadChildrenOf(parentId: number, parentName: string, parentVisualDepth: number) {
    if (loadedParentIds.has(parentId)) return;
    setLoadedParentIds((prev) => new Set(prev).add(parentId));

    const { data } = await api.get(`/comments/${parentId}/replies`);
    const childVisualDepth = Math.min(parentVisualDepth + 1, MAX_VISUAL_DEPTH);
    const newItems: FlatItem[] = data.data.map((r: Comment) => ({
      comment: r,
      visualDepth: childVisualDepth,
      replyingToName: parentName,
    }));

    setFlatItems((prev) => {
      const parentIndex = prev.findIndex((item) => item.comment.id === parentId);
      if (parentIndex === -1) return [...prev, ...newItems];
      const before = prev.slice(0, parentIndex + 1);
      const after = prev.slice(parentIndex + 1);
      return [...before, ...newItems, ...after];
    });
  }

  async function handleToggleReplies() {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setLoading(true);
    await loadChildrenOf(comment.id, comment.user.name, 0);
    setLoading(false);
    setShowReplies(true);
  }

  async function handleReplyPosted() {
    setFlatItems([]);
    setLoadedParentIds(new Set());
    setLoading(true);
    await loadChildrenOf(comment.id, comment.user.name, 0);
    setLoading(false);
    setShowReplies(true);
    setComment((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));
  }

  return (
    <div className="py-3">
      <CommentRow
        comment={comment}
        pollAuthorId={pollAuthorId}
        onReacted={handleRootReacted}
        onReplyPosted={handleReplyPosted}
      />

      {comment.replyCount > 0 && (
        <button
          onClick={handleToggleReplies}
          disabled={loading}
          className="mt-2 pl-11 text-xs font-semibold text-gray-500 hover:underline"
        >
          {loading ? 'Đang tải...' : showReplies ? 'Ẩn phản hồi' : `Xem ${comment.replyCount} phản hồi`}
        </button>
      )}

      {showReplies && (
        <div className="mt-2 space-y-3">
          {flatItems.map((item) => (
            <div
              key={item.comment.id}
              className={item.visualDepth === 1 ? 'ml-8 border-l-2 border-gray-100 pl-4' : 'ml-16 border-l-2 border-gray-100 pl-4'}
            >
              <CommentRow
                comment={item.comment}
                pollAuthorId={pollAuthorId}
                replyingToName={item.replyingToName}
                onReacted={handleFlatReacted}
                onReplyPosted={handleReplyPosted}
              />
              {item.comment.replyCount > 0 && !loadedParentIds.has(item.comment.id) && (
                <button
                  onClick={() => loadChildrenOf(item.comment.id, item.comment.user.name, item.visualDepth)}
                  className="mt-2 pl-11 text-xs font-semibold text-gray-500 hover:underline"
                >
                  Xem {item.comment.replyCount} phản hồi
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}