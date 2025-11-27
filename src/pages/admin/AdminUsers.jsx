import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, user: null });
  const [roleConfirm, setRoleConfirm] = useState({ show: false, user: null, newRole: null });

  useEffect(() => {
    loadData();
  }, [searchQuery, roleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        limit: 100,
      };
      const response = await userService.getAllUsers(params);
      const usersData = Array.isArray(response) ? response : (response.data || response);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) {
      toast.warning('Anda tidak dapat menghapus akun Anda sendiri');
      return;
    }
    setDeleteConfirm({ show: true, user });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.user) {
      try {
        await userService.deleteUser(deleteConfirm.user.id);
        toast.success(`${deleteConfirm.user.name} berhasil dihapus`);
        loadData();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
      }
    }
  };

  const handleRoleToggle = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    if (user.id === currentUser?.id) {
      toast.warning('Anda tidak dapat mengubah role Anda sendiri');
      return;
    }
    
    setRoleConfirm({ show: true, user, newRole });
  };

  const confirmRoleChange = async () => {
    if (roleConfirm.user && roleConfirm.newRole) {
      try {
        await userService.updateUser(roleConfirm.user.id, { role: roleConfirm.newRole });
        const actionText = roleConfirm.newRole === 'admin' ? 'dijadikan Admin' : 'dijadikan User biasa';
        toast.success(`${roleConfirm.user.name} berhasil ${actionText} ✅`);
        loadData();
      } catch (error) {
        console.error('Error updating role:', error);
        toast.error(error.response?.data?.message || 'Gagal mengubah role pengguna');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
              <p className="text-gray-600 mt-1">Ubah role atau hapus akun pengguna</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Pengguna
                </label>
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Semua Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Informasi:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Klik badge role untuk mengubah antara Admin dan User</li>
                  <li>Anda tidak dapat mengubah atau menghapus akun Anda sendiri</li>
                  <li>Pengguna dapat mengubah data profil mereka sendiri di halaman pengaturan</li>
                </ul>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Pengguna
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Terdaftar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          Tidak ada pengguna ditemukan
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {user.name?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                  {user.id === currentUser?.id && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      Anda
                                    </span>
                                  )}
                                </p>
                                {user.phone && (
                                  <p className="text-sm text-gray-500">{user.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRoleToggle(user)}
                              disabled={user.id === currentUser?.id}
                              className={`badge cursor-pointer transition-all hover:scale-105 ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={user.id === currentUser?.id ? 'Tidak dapat mengubah role sendiri' : 'Klik untuk mengubah role'}
                            >
                              {user.role === 'admin' ? '🔐 Admin' : '👤 User'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={user.id === currentUser?.id}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                user.id === currentUser?.id 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              title={user.id === currentUser?.id ? 'Tidak dapat menghapus diri sendiri' : 'Hapus Pengguna'}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, user: null })}
        onConfirm={confirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirm.user?.name}"? Semua data terkait pengguna ini (pesanan, keranjang, wishlist) akan ikut terhapus.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Role Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={roleConfirm.show}
        onClose={() => setRoleConfirm({ show: false, user: null, newRole: null })}
        onConfirm={confirmRoleChange}
        title={roleConfirm.newRole === 'admin' ? 'Jadikan Admin' : 'Lepas Hak Admin'}
        message={
          roleConfirm.newRole === 'admin'
            ? `Apakah Anda yakin ingin menjadikan "${roleConfirm.user?.name}" sebagai Admin? Admin memiliki akses penuh ke panel administrasi.`
            : `Apakah Anda yakin ingin melepas hak Admin dari "${roleConfirm.user?.name}"? Pengguna ini akan menjadi user biasa dan tidak dapat mengakses panel admin.`
        }
        confirmText={roleConfirm.newRole === 'admin' ? 'Ya, Jadikan Admin' : 'Ya, Lepas Admin'}
        cancelText="Batal"
        type={roleConfirm.newRole === 'admin' ? 'info' : 'warning'}
      />
    </div>
  );
};

export default AdminUsers;
