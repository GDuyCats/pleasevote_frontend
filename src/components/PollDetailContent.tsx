'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PollDetail, Comment } from '@/types/poll';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import CommentItem from '@/components/CommentItem';
import PollOptionRow from '@/components/PollOptionRow';
import { useAuthPrompt } from '@/context/AuthPromptContext';

export default function PollDetailContent({ pollId }: { pollId: string }) {
  const { translate } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();

    const [poll, setPoll] = useState<PollDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentCursor, setCommentCursor] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState<number | null>(null);
    const [voteError, setVoteError] = useState('');
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [showAddOption, setShowAddOption] = useState(false);
    const [newOptionLabel, setNewOptionLabel] = useState('');
    const [addingOption, setAddingOption] = useState(false);

    const { openPrompt } = useAuthPrompt();

    async function fetchPoll() {
        try {
            const { data } = await api.get(`/polls/${pollId}`);
            setPoll(data);
        } catch (err) {
            setNotFound(true);
        }
    }

    async function fetchComments(cursor?: number) {
        const { data } = await api.get(`/comments/polls/${pollId}`, {
            params: cursor ? { cursor, limit: 10 } : { limit: 10 },
        });
        setComments((prev) => (cursor ? [...prev, ...data.data] : data.data));
        setCommentCursor(data.nextCursor);
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchPoll(), fetchComments()]).finally(() => setLoading(false));
    }, [pollId]);

    async function handleVote(optionId: number) {
        if (!user) {
            openPrompt();
            return;
        }
        setVoting(optionId);
        setVoteError('');
        try {
            await api.post(`/polls/${pollId}/vote`, { poll_option_id: optionId });
            await fetchPoll();
        } catch {
            setVoteError('Chưa thể gửi bình chọn. Bạn thử lại nhé.');
        } finally {
            setVoting(null);
        }
    }

    function handleOptionUpdated(optionId: number, updates: Partial<any>) {
        setPoll((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                options: prev.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
            };
        });
    }

    async function handleAddOption(e: React.FormEvent) {
        e.preventDefault();
        if (!user) {
            openPrompt();
            return;
        }
        if (!newOptionLabel.trim()) return;

        setAddingOption(true);
        try {
            await api.post(`/polls/${pollId}/options`, { label: newOptionLabel });
            setNewOptionLabel('');
            setShowAddOption(false);
            await fetchPoll();
        } finally {
            setAddingOption(false);
        }
    }

    function applyOptimisticReaction(newType: string | null) {
        setPoll((prev) => {
            if (!prev) return prev;

            const updatedReactions = { ...prev.reactions };
            const oldType = prev.myReaction;

            // Remove the count from the old reaction type, if any
            if (oldType) {
                updatedReactions[oldType as keyof typeof updatedReactions] = Math.max(
                    0,
                    updatedReactions[oldType as keyof typeof updatedReactions] - 1
                );
            }
            // Add the count to the new reaction type, if any
            if (newType) {
                updatedReactions[newType as keyof typeof updatedReactions] =
                    (updatedReactions[newType as keyof typeof updatedReactions] || 0) + 1;
            }

            return { ...prev, reactions: updatedReactions, myReaction: newType };
        });
    }

    async function handleReact(type: string) {
        if (!user) {
            openPrompt();
            return;
        }

        // Update the UI instantly, then sync with the server in the background.
        // If the request fails, refetch to correct any drift.
        applyOptimisticReaction(type);

        try {
            await api.post(`/polls/${pollId}/react`, { type });
        } catch {
            await fetchPoll();
        }
    }

    async function handleRemoveReact() {
        if (!user) {
            openPrompt();
            return;
        }

        applyOptimisticReaction(null);

        try {
            await api.delete(`/polls/${pollId}/react`);
        } catch {
            await fetchPoll();
        }
    }

    async function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        if (!user) {
            openPrompt();
            return;
        }

        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            await api.post(`/comments/polls/${pollId}`, { content: commentText });
            setCommentText('');
            await fetchComments();
            await fetchPoll();
        } finally {
            setSubmittingComment(false);
        }
    }

    if (loading) {
        return <p className="p-10 text-center text-muted">{translate("Đang tải...")}</p>;
    }

    if (notFound || !poll) {
        return <p className="p-10 text-center text-muted">{translate("Không tìm thấy bình chọn này.")}</p>;
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

    return (
        <div>
            {poll.background_image && (
                <div
                    className="aspect-[16/9] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${poll.background_image})` }}
                />
            )}

            <div className="p-card">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    {poll.author.avatar_url ? (
                        <img src={poll.author.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-muted text-body-md font-bold text-accent">
                            {poll.author.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="min-w-0 flex-1 basis-24 text-author [overflow-wrap:anywhere]">{poll.author.name}</span>
                    {poll.isClosed && (
                        <span className="ml-auto shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-metadata font-medium text-muted">
                            {translate("Đã đóng")} </span>
                    )}
                </div>

                <h1 className="mb-4 text-foreground [overflow-wrap:anywhere] text-card-title">{poll.question}</h1>

                <div className="space-y-3">
                    {poll.options.map((option) => {
                        const percent = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
                        return (
                            <PollOptionRow
                                key={option.id}
                                option={option}
                                percent={percent}
                                pending={voting === option.id}
                                disabled={poll.isClosed || voting !== null}
                                pollAuthorId={poll.author.id}
                                pollId={poll.id}
                                onVote={handleVote}
                                onOptionUpdated={handleOptionUpdated}
                            />
                        );
                    })}
                </div>

                {voteError && <p role="alert" className="ui-feedback mt-3 bg-danger-soft text-danger">{translate(voteError)}</p>}

                {poll.allow_user_options && !poll.isClosed && (
                    <div className="mt-3">
                        {showAddOption ? (
                            <form onSubmit={handleAddOption} className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="text"
                                    value={newOptionLabel}
                                    aria-label={translate("Lựa chọn mới")}
                                    onChange={(e) => setNewOptionLabel(e.target.value)}
                                    placeholder={translate("Nhập lựa chọn mới...")}
                                    className="ui-input flex-1 min-w-0"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={addingOption}
                                    className="ui-button ui-button-primary disabled:opacity-50"
                                >
                                    {translate("Thêm")} </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddOption(false)}
                                    className="ui-button ui-button-ghost text-muted hover:bg-surface-muted"
                                >
                                    {translate("Huỷ")} </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowAddOption(true)}
                                className="ui-button ui-button-ghost text-accent hover:underline"
                            >
                                {translate("+ Thêm lựa chọn của bạn")} </button>
                        )}
                    </div>
                )}

                <p className="mt-3 text-metadata text-muted">{translate('pollVotes', { count: totalVotes })}</p>

                <ReactionBar
                    reactions={poll.reactions}
                    commentCount={poll.totalCommentCount}
                    myReaction={poll.myReaction}
                    onReact={handleReact}
                    onRemove={handleRemoveReact}
                />
            </div>

            <div className="border-t border-border p-card">
                <h2 className="mb-3 text-foreground text-section-title">{translate("Bình luận")}</h2>

                <form onSubmit={handleSubmitComment} className="mb-4 flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={commentText}
                        aria-label={translate("Nội dung bình luận")}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={user ? translate("Viết bình luận...") : translate("Đăng nhập để bình luận")}
                        className="ui-input flex-1 min-w-0"
                    />
                    <button
                        type="submit"
                        disabled={submittingComment}
                        className="ui-button ui-button-primary disabled:opacity-50"
                    >
                        {translate("Gửi")} </button>
                </form>

                {comments.length === 0 ? (
                    <p className="text-body-md text-muted">{translate("Chưa có bình luận nào.")}</p>
                ) : (
                    <div className="divide-y divide-border">
                        {comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} pollAuthorId={poll.author.id} />
                        ))}
                    </div>
                )}

                {commentCursor && (
                    <button
                        onClick={() => fetchComments(commentCursor)}
                        className="ui-button ui-button-ghost mt-3 text-accent hover:underline"
                    >
                        {translate("Xem thêm bình luận")} </button>
                )}
            </div>
        </div>
    );
}
