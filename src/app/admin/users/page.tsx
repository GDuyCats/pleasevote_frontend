'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import AdminGuard from '@/components/AdminGuard';
import AdminNav from '@/components/AdminNav';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_locked: boolean;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLock(u: AdminUser) {
    setActioningId(u.id);
    try {
      await api.patch(`/users/${u.id}/${u.is_locked ? 'unlock' : 'lock'}`);
      await fetchUsers();
    } finally {
      setActioningId(null);
    }
  }

  async function handleChangeRole(u: AdminUser, newRole: string) {
    setActioningId(u.id);
    try {
      await api.patch(`/users/${u.id}/role`, { role: newRole });
      await fetchUsers();
    } finally {
      setActioningId(null);
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-1 text-xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mb-4 text-sm text-gray-500">Khoá tài khoản hoặc thay đổi quyền hạn</p>

          <AdminNav />

          {loading ? (
            <p className="text-center text-gray-400">Đang tải...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Quyền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          disabled={actioningId === u.id}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.is_locked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}
                        >
                          {u.is_locked ? 'Đã khoá' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleLock(u)}
                          disabled={actioningId === u.id || u.role === 'admin'}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                        >
                          {u.is_locked ? 'Mở khoá' : 'Khoá'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}