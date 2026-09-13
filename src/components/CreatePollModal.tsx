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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Tạo bình chọn mới</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Câu hỏi</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Hôm nay ăn gì?"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Kiểu chọn</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="single_choice">Chỉ 1 lựa chọn</option>
                <option value="multiple_choice">Nhiều lựa chọn</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ai xem được</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="public">Công khai</option>
                <option value="private">Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allowUserOptions}
              onChange={(e) => setAllowUserOptions(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Cho phép người khác thêm lựa chọn riêng
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Các lựa chọn</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Lựa chọn ${index + 1}`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="rounded-lg px-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
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
              className="mt-2 text-sm font-medium text-purple-600 hover:underline"
            >
              + Thêm lựa chọn
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo bình chọn'}
          </button>
        </form>
      </div>
    </div>
  );
}