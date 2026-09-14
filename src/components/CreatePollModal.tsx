'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import Dialog from '@/components/Dialog';
import AppIcon from '@/components/AppIcon';
import { api } from '@/lib/api';
import { usePollModal } from '@/context/PollModalContext';

export default function CreatePollModal() {
  const { translate } = useLanguage();
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Tạo bình chọn thất bại, thử lại nhé'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onClose={closeModal} label={translate("Tạo bình chọn mới")}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-foreground text-card-title">{translate("Tạo bình chọn mới")}</h2>
          <button type="button" onClick={closeModal} aria-label={translate("Đóng")} className="ui-button ui-button-ghost h-11 w-11 shrink-0 text-muted hover:bg-surface-muted p-0">
            <AppIcon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="poll-question" className="mb-1 block text-foreground text-label-lg">{translate("Câu hỏi")}</label>
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder={translate("Hôm nay ăn gì?")}
              className="ui-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="poll-type" className="mb-1 block text-foreground text-label-lg">{translate("Kiểu chọn")}</label>
              <select
                id="poll-type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="ui-input w-full"
              >
                <option value="single_choice">{translate("Chỉ 1 lựa chọn")}</option>
                <option value="multiple_choice">{translate("Nhiều lựa chọn")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="poll-visibility" className="mb-1 block text-foreground text-label-lg">{translate("Ai xem được")}</label>
              <select
                id="poll-visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="ui-input w-full"
              >
                <option value="public">{translate("Công khai")}</option>
                <option value="private">{translate("Chỉ mình tôi")}</option>
              </select>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-2 text-foreground text-label-lg">
            <input
              type="checkbox"
              checked={allowUserOptions}
              onChange={(e) => setAllowUserOptions(e.target.checked)}
              className="h-[18px] w-[18px] shrink-0 rounded border-border-strong text-accent focus:ring-accent"
            />
            {translate("Cho phép người khác thêm lựa chọn riêng")} </label>

          <div>
            <p id="poll-options-label" className="mb-1 text-label-lg text-foreground">{translate("Các lựa chọn")}</p>
            <div role="group" aria-labelledby="poll-options-label" className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    aria-label={translate('optionNumber', { count: index + 1 })}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={translate('optionNumber', { count: index + 1 })}
                    className="ui-input flex-1 min-w-0"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      aria-label={translate('removeOption', { count: index + 1 })}
                      className="ui-button ui-button-ghost h-11 w-11 shrink-0 text-muted hover:bg-surface-muted hover:text-danger p-0"
                    >
                      <AppIcon name="close" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="ui-button ui-button-ghost mt-2 text-accent hover:underline"
            >
              {translate("+ Thêm lựa chọn")} </button>
          </div>

          {error && <p role="alert" className="ui-feedback bg-danger-soft text-danger">{translate(error)}</p>}

          <button
            type="submit"
            disabled={loading}
            className="ui-button ui-button-primary w-full disabled:opacity-50"
          >
            {loading ? translate("Đang tạo...") : translate("Tạo bình chọn")}
          </button>
        </form>
    </Dialog>
  );
}
