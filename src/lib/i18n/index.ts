import { english } from './messages';

export type Language = 'vi' | 'en';
export const LANGUAGE_STORAGE_KEY = 'pleasevote-language';
export const LANGUAGE_CHANGE_EVENT = 'pleasevote-language-change';
export const locales = { vi: 'vi-VN', en: 'en-US' } as const;

const phrases = {
  votes: { vi: '{count} phiếu', en: { one: '{count} vote', other: '{count} votes' } },
  pollVotes: { vi: '{count} lượt bình chọn', en: { one: '{count} vote', other: '{count} votes' } },
  comments: { vi: '{count} bình luận', en: { one: '{count} comment', other: '{count} comments' } },
  replies: { vi: 'Xem {count} phản hồi', en: { one: 'View {count} reply', other: 'View {count} replies' } },
  transactions: { vi: '{count} giao dịch', en: { one: '{count} transaction', other: '{count} transactions' } },
  hiddenPackages: { vi: '(+{count} đã ẩn)', en: '(+{count} hidden)' },
  coins: { vi: '{count} coin', en: { one: '{count} coin', other: '{count} coins' } },
  coinPrice: { vi: '🪙 {count}', en: '🪙 {count}' },
  packPrice: { vi: 'Mua cả bộ — 🪙 {count}', en: 'Buy the pack — 🪙 {count}' },
  optionNumber: { vi: 'Lựa chọn {count}', en: 'Option {count}' },
  removeOption: { vi: 'Xóa lựa chọn {count}', en: 'Remove option {count}' },
  revenueCurrency: { vi: 'Doanh thu ({currency})', en: 'Revenue ({currency})' },
  stickerSlots: { vi: '+{count} chỗ', en: { one: '+{count} slot', other: '+{count} slots' } },
  slotPurchase: { vi: 'Mỗi lần mở khoá thêm {count} chỗ với 🪙 {price}', en: { one: 'Unlock {count} more slot for 🪙 {price}', other: 'Unlock {count} more slots for 🪙 {price}' } },
  slotBalance: { vi: 'Bạn không đủ coin. Số dư hiện tại: 🪙 {count}', en: 'Not enough coins. Your current balance: 🪙 {count}' },
  stickersBy: { vi: '{count} sticker · bởi {author}', en: { one: '{count} sticker · by {author}', other: '{count} stickers · by {author}' } },
  profileOf: { vi: 'Trang cá nhân của {name}', en: 'Profile of {name}' },
  roleOf: { vi: 'Vai trò của {name}', en: 'Role of {name}' },
  viewPoll: { vi: 'Xem bình chọn: {question}', en: 'View poll: {question}' },
  removeReaction: { vi: 'Gỡ cảm xúc {reaction}', en: 'Remove reaction: {reaction}' },
  currentAppearance: { vi: 'Giao diện {mode}', en: '{mode} appearance' },
  greetingMorning: { vi: 'Chào buổi sáng!', en: 'Good morning!' },
  greetingAfternoon: { vi: 'Chào buổi chiều!', en: 'Good afternoon!' },
  greetingEvening: { vi: 'Chào buổi tối!', en: 'Good evening!' },
  greetingNight: { vi: 'Chúc ngủ ngon!', en: 'Good night!' },
} as const;

type Phrase = string | { one: string; other: string };
type Parameters = Record<string, string | number>;
export type Translator = (key: string, parameters?: Parameters) => string;
const vietnamese: Record<string, string> = {
  User: 'Người dùng', Staff: 'Nhân viên', Admin: 'Quản trị viên',
  'Sticker Marketplace': 'Chợ sticker', Pack: 'Bộ sticker', preview: 'Xem trước sticker',
  'Slot sticker:': 'Chỗ lưu sticker:',
  'Bạn đã dùng hết slot sticker.': 'Bạn đã dùng hết chỗ lưu sticker.',
  'Mua thêm slot ở trên để tiếp tục tạo sticker mới.': 'Mua thêm chỗ lưu ở trên để tiếp tục tạo sticker mới.',
  'Chưa có pack nào.': 'Chưa có bộ sticker nào.',
  'Mua pack thất bại': 'Mua bộ sticker thất bại',
  'Mua thêm slot thất bại': 'Mua thêm chỗ lưu sticker thất bại',
};

export function parseLanguage(value: unknown): Language {
  return value === 'en' ? 'en' : 'vi';
}

export function createTranslator(language: Language): Translator {
  const number = new Intl.NumberFormat(locales[language]);
  const plural = new Intl.PluralRules(locales[language]);
  return (key, parameters = {}) => {
    let message: string;
    if (Object.hasOwn(phrases, key)) {
      const phrase: Phrase = phrases[key as keyof typeof phrases][language];
      message = typeof phrase === 'string' ? phrase : phrase[plural.select(Number(parameters.count)) === 'one' ? 'one' : 'other'];
    } else {
      message = language === 'en'
        ? (Object.hasOwn(english, key) ? english[key as keyof typeof english] : key)
        : (Object.hasOwn(vietnamese, key) ? vietnamese[key] : key);
    }
    return message.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = Object.hasOwn(parameters, name) ? parameters[name] : undefined;
      return typeof value === 'number' ? number.format(value) : value ?? placeholder;
    });
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { status?: number; data?: { message?: unknown; error?: unknown } } } | null)?.response;
  const message = response?.data?.error ?? response?.data?.message;
  if (typeof message === 'string' && Object.hasOwn(english, message)) return message;
  if (response?.status === 429) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.';
  return fallback;
}

export function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  const description = document.querySelector('meta[name="description"]');
  description?.setAttribute('content', createTranslator(language)('Bình chọn vui vẻ cùng bạn bè'));
}

export const languageInitScript =   "(function(){var language='vi';try{if(localStorage.getItem('pleasevote-language')==='en')language='en';}catch(error){}document.documentElement.lang=language;document.documentElement.dataset.language=language;})();";
