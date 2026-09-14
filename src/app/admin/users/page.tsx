'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
      <div className="bg-background">


        <main className="page-shell max-w-4xl">
          <h1 className="mb-1 text-foreground text-page-title">Quản lý người dùng</h1>
          <p className="mb-4 text-sm text-muted">Khoá tài khoản hoặc thay đổi quyền hạn</p>

          <AdminNav />

          {loading ? (
            <p className="text-center text-muted">Đang tải...</p>
          ) : (
            <div role="region" aria-label="Danh sách người dùng, cuộn ngang để xem đầy đủ" tabIndex={0} className="max-w-full overflow-x-auto rounded-card bg-surface ring-1 ring-border">
              <table className="w-full min-w-[640px] text-body-md">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Quyền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          disabled={actioningId === u.id}
                          className="rounded-card border border-border px-2 py-1 text-control focus:border-accent focus:outline-none min-h-11"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.is_locked ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'
                          }`}
                        >
                          {u.is_locked ? 'Đã khoá' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleLock(u)}
                          disabled={actioningId === u.id || u.role === 'admin'}
                          className="min-h-11 rounded-card bg-surface-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-hover disabled:opacity-40"
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
