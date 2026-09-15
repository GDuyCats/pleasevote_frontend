import type { EntityId } from '@/types/api';

export const endpoints = {
  auth: {
    login: '/auth/login',
    google: '/auth/google',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  users: {
    me: '/users/me',
    avatar: '/users/me/avatar',
    list: '/users',
    lock: (userId: EntityId) => '/users/' + userId + '/lock',
    unlock: (userId: EntityId) => '/users/' + userId + '/unlock',
    role: (userId: EntityId) => '/users/' + userId + '/role',
  },
  polls: {
    list: '/polls',
    detail: (pollId: EntityId) => '/polls/' + pollId,
    vote: (pollId: EntityId) => '/polls/' + pollId + '/vote',
    options: (pollId: EntityId) => '/polls/' + pollId + '/options',
    reaction: (pollId: EntityId) => '/polls/' + pollId + '/react',
    optionReaction: (optionId: EntityId) => '/polls/options/' + optionId + '/react',
  },
  comments: {
    poll: (pollId: EntityId) => '/comments/polls/' + pollId,
    option: (optionId: EntityId) => '/comments/options/' + optionId,
    replies: (commentId: EntityId) => '/comments/' + commentId + '/replies',
    reaction: (commentId: EntityId) => '/comments/' + commentId + '/react',
  },
  coins: {
    balance: '/coins/balance',
    checkout: '/coins/checkout',
  },
  coinPackages: {
    list: '/coin-packages',
    all: '/coin-packages/all',
    detail: (packageId: EntityId) => '/coin-packages/' + packageId,
  },
  stickers: {
    list: '/stickers',
    mine: '/stickers/mine',
    purchase: (stickerId: EntityId) => '/stickers/' + stickerId + '/purchase',
    slotStatus: '/stickers/slots/status',
    purchaseSlots: '/stickers/slots/purchase',
  },
  stickerPacks: {
    list: '/sticker-packs',
    purchase: (packId: EntityId) => '/sticker-packs/' + packId + '/purchase',
  },
  admin: {
    stats: '/admin/stats',
  },
} as const;
