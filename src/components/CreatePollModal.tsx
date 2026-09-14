'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePollModal } from '@/context/PollModalContext';

export default function CreatePollModal() {
  const { isOpen, closeModal, triggerRefresh } = usePollModal();
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<'single_choice' | 'multiple_choice'>('single_choice');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [allowUserOptions, setAllowUserOptions] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  function addOption() {
    setOptions((prev) => [...prev, '']);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setQuestion('');
    setType('single_choice');
    setVisibility('public');
    setOptions(['', '']);
    setAllowUserOptions(false);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError('Cần ít nhất 2 lựa chọn');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('type', type);
      formData.append('visibility', visibility);
      formData.append('allow_user_options', String(allowUserOptions));
      formData.append('options', JSON.stringify(cleanOptions.map((label) => ({ label }))));

      await api.post('/polls', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      resetForm();
      closeModal();
      triggerRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tạo bình chọn thất bại, thử lại nhé');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 px-4">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-panel border border-border bg-surface p-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-foreground text-card-title">Tạo bình chọn mới</h2>
          <button type="button" onClick={closeModal} aria-label="Đóng" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-muted">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Câu hỏi</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Hôm nay ăn gì?"
              className="w-full rounded-card border border-border-strong px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-control min-h-11"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Kiểu chọn</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11"
              >
                <option value="single_choice">Chỉ 1 lựa chọn</option>
                <option value="multiple_choice">Nhiều lựa chọn</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Ai xem được</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11"
              >
                <option value="public">Công khai</option>
                <option value="private">Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={allowUserOptions}
              onChange={(e) => setAllowUserOptions(e.target.checked)}
              className="h-[18px] w-[18px] shrink-0 rounded border-border-strong text-accent focus:ring-accent"
            />
            Cho phép người khác thêm lựa chọn riêng
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Các lựa chọn</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Lựa chọn ${index + 1}`}
                    className="flex-1 rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11 min-w-0"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="h-11 w-11 shrink-0 rounded-card px-2 text-muted hover:bg-surface-muted hover:text-danger"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="min-h-11 mt-2 text-sm font-medium text-accent hover:underline"
            >
              + Thêm lựa chọn
            </button>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-primary py-2 text-on-primary transition hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
          >
            {loading ? 'Đang tạo...' : 'Tạo bình chọn'}
          </button>
        </form>
      </div>
    </div>
  );
}
