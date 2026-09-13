'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

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
        } catch (err: any) {
            setError(err.response?.data?.error || 'Cập nhật thất bại');
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
        } catch (err: any) {
            setError(err.response?.data?.error || 'Tải ảnh thất bại');
        } finally {
            setUploadingAvatar(false);
        }
    }

    if (authLoading || loading || !profile) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <p className="mt-10 text-center text-gray-400">Đang tải...</p>
            </div>
        );
    }

    const joinedDate = new Date(profile.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="mx-auto max-w-lg px-4 py-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h1 className="mb-6 text-xl font-bold text-gray-900">Hồ sơ của bạn</h1>

                    {/* Avatar */}
                    <div className="mb-6 flex flex-col items-center">
                        <div className="relative">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-3xl font-bold text-purple-600">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-600 text-white shadow hover:bg-purple-700">
                                {uploadingAvatar ? (
                                    <span className="text-xs">...</span>
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
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Editable name */}
                    <form onSubmit={handleSaveName} className="mb-6 space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Tên hiển thị</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {message && <p className="text-sm text-green-600">{message}</p>}

                        <button
                            type="submit"
                            disabled={saving || name === profile.name}
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>

                    {/* Read-only account info */}
                    <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-800">{profile.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Trạng thái email</span>
                            <span className={`font-medium ${profile.email_verified ? 'text-green-600' : 'text-orange-500'}`}>
                                {profile.email_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Số coin</span>
                            <span className="font-medium text-gray-800">🪙 {profile.coin_balance}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngày tham gia</span>
                            <span className="font-medium text-gray-800">{joinedDate}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}