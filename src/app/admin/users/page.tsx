'use client';

import { useLanguage } from '@/context/LanguageContext';
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
  const { translate } = useLanguage();
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


        <main className="page-shell">
          <h1 className="mb-1 text-foreground text-page-title">{translate("Quản lý người dùng")}</h1>
          <p className="mb-4 text-body-md text-muted">{translate("Khoá tài khoản hoặc thay đổi quyền hạn")}</p>

          <AdminNav />

          {loading ? (
            <p className="text-center text-muted">{translate("Đang tải...")}</p>
          ) : (
            <div role="region" aria-label={translate("Danh sách người dùng, cuộn ngang để xem đầy đủ")} tabIndex={0} className="max-w-full overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full min-w-[640px] text-body-md">
                <thead>
                  <tr className="border-b border-border-soft text-left text-metadata text-muted">
                    <th className="px-4 py-3">{translate("Người dùng")}</th>
                    <th className="px-4 py-3">{translate("Email")}</th>
                    <th className="px-4 py-3">{translate("Quyền")}</th>
                    <th className="px-4 py-3">{translate("Trạng thái")}</th>
                    <th className="px-4 py-3">{translate("Hành động")}</th>
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
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted text-metadata font-bold text-accent">
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
                          aria-label={translate('roleOf', { name: u.name })}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          disabled={actioningId === u.id}
                          className="ui-input"
                        >
                          <option value="user">{translate("User")}</option>
                          <option value="staff">{translate("Staff")}</option>
                          <option value="admin">{translate("Admin")}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-metadata font-medium ${
                            u.is_locked ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'
                          }`}
                        >
                          {u.is_locked ? translate("Đã khoá") : translate("Hoạt động")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleLock(u)}
                          disabled={actioningId === u.id || u.role === 'admin'}
                          className="ui-button ui-button-secondary text-foreground disabled:opacity-40"
                        >
                          {u.is_locked ? translate("Mở khoá") : translate("Khoá")}
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
