'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';


interface FullProfile {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    role: string;
    coin_balance: number;
    email_verified: boolean;
    created_at: string;
}

export default function ProfilePage() {
  const { translate, formatDate, formatNumber } = useLanguage();
    const { user, loading: authLoading, updateUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchProfile();
        }
    }, [user, authLoading]);

    async function fetchProfile() {
        setLoading(true);
        try {
            const { data } = await api.get('/users/me');
            setProfile(data);
            setName(data.name);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);
        try {
            const { data } = await api.patch('/users/me', { name });
            setProfile(data);
            updateUser({ name: data.name });
            setMessage('Đã cập nhật tên thành công');
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Cập nhật thất bại'));
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const { data } = await api.post('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setProfile((prev) => (prev ? { ...prev, avatar_url: data.avatar_url } : prev));
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Tải ảnh thất bại'));
        } finally {
            setUploadingAvatar(false);
        }
    }

    if (authLoading || loading || !profile) {
        return (
            <div className="bg-background">

                <p className="mt-10 text-center text-muted">{translate("Đang tải...")}</p>
            </div>
        );
    }

    const joinedDate = formatDate(profile.created_at, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-background">


            <main className="page-shell">
                <div className="ui-card">
                    <h1 className="mb-6 text-foreground text-page-title">{translate("Hồ sơ của bạn")}</h1>

                    {/* Avatar */}
                    <div className="mb-6 flex flex-col items-start">
                        <div className="relative">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-muted text-metric font-bold text-accent">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary ring-1 ring-border hover:bg-primary-hover focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
                                {uploadingAvatar ? (
                                    <span className="text-metadata">...</span>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.132.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.804-2.169a47.865 47.865 0 00-1.132-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                    </svg>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                    aria-label={translate("Đổi ảnh đại diện")}
                                    className="sr-only peer"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Editable name */}
                    <form onSubmit={handleSaveName} className="mb-6 max-w-2xl space-y-3">
                        <div>
                            <label htmlFor="profile-name" className="mb-1 block text-foreground text-label-lg">{translate("Tên hiển thị")}</label>
                            <input
                                id="profile-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="ui-input w-full"
                            />
                        </div>

                        {error && <p role="alert" className="ui-feedback bg-danger-soft text-danger">{translate(error)}</p>}
                        {message && <p role="status" className="ui-feedback bg-success-soft text-success">{translate(message)}</p>}

                        <button
                            type="submit"
                            disabled={saving || name === profile.name}
                            className="ui-button ui-button-primary disabled:opacity-50"
                        >
                            {saving ? translate("Đang lưu...") : translate("Lưu thay đổi")}
                        </button>
                    </form>

                    {/* Read-only account info */}
                    <div className="space-y-3 border-t border-border pt-4 text-body-md">
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                            <span className="text-muted">{translate("Email")}</span>
                            <span className="min-w-0 font-medium text-foreground [overflow-wrap:anywhere] sm:text-right">{profile.email}</span>
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                            <span className="text-muted">{translate("Trạng thái email")}</span>
                            <span className={`font-medium ${profile.email_verified ? 'text-success' : 'text-warning'}`}>
                                {profile.email_verified ? translate("Đã xác thực") : translate("Chưa xác thực")}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                            <span className="text-muted">{translate("Số coin")}</span>
                            <span className="font-medium text-foreground">🪙 {formatNumber(profile.coin_balance)}</span>
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                            <span className="text-muted">{translate("Ngày tham gia")}</span>
                            <span className="font-medium text-foreground">{joinedDate}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
