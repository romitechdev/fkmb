import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Download, Upload, FileSpreadsheet, HelpCircle } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, User, Role, Departemen } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departemens, setDepartemens] = useState<Departemen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState<string>('all');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Import modal states
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [form, setForm] = useState({
        email: '',
        name: '',
        nim: '',
        phone: '',
        fakultas: '',
        prodi: '',
        angkatan: '',
        roleId: '',
        departemenId: '',
        password: '',
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchDepartemens();
    }, [page, search, selectedRoleId]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            let url = `/users?page=${page}&limit=10&search=${search}`;
            if (selectedRoleId !== 'all') {
                url += `&roleId=${selectedRoleId}`;
            }
            const res = await api.get<ApiResponse<User[]>>(url);
            setUsers(res.data.data);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get<ApiResponse<Role[]>>('/roles');
            setRoles(res.data.data);
        } catch {
            console.error('Failed to fetch roles');
        }
    };

    const fetchDepartemens = async () => {
        try {
            const res = await api.get<ApiResponse<Departemen[]>>('/departemen');
            setDepartemens(res.data.data);
        } catch {
            console.error('Failed to fetch departemens');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setForm({
            email: '',
            name: '',
            nim: '',
            phone: '',
            fakultas: '',
            prodi: '',
            angkatan: '',
            roleId: '',
            departemenId: '',
            password: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setForm({
            email: user.email,
            name: user.name,
            nim: user.nim || '',
            phone: user.phone || '',
            fakultas: user.fakultas || '',
            prodi: user.prodi || '',
            angkatan: user.angkatan || '',
            roleId: user.roleId || '',
            departemenId: user.departemenId || '',
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload: Record<string, string | null> = {
                email: form.email,
                name: form.name,
                nim: form.nim || null,
                phone: form.phone || null,
                fakultas: form.fakultas || null,
                prodi: form.prodi || null,
                angkatan: form.angkatan || null,
                roleId: form.roleId || null,
                departemenId: form.departemenId || null,
            };

            if (form.password) {
                payload.password = form.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload);
                toast.success('User berhasil diperbarui');
            } else {
                payload.password = form.password || 'password123';
                await api.post('/users', payload);
                toast.success('User berhasil ditambahkan');
            }

            setIsModalOpen(false);
            fetchUsers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal menyimpan user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        setIsSaving(true);

        try {
            await api.delete(`/users/${deletingUser.id}`);
            toast.success('User berhasil dihapus');
            setIsDeleteOpen(false);
            setDeletingUser(null);
            fetchUsers();
        } catch {
            toast.error('Gagal menghapus user');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (user: User) => {
        try {
            await api.put(`/users/${user.id}`, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
            fetchUsers();
        } catch {
            toast.error('Gagal mengubah status');
        }
    };

    // Export users to Excel
    const handleExport = async () => {
        try {
            const params = selectedRoleId !== 'all' ? `?roleId=${selectedRoleId}` : '';
            const response = await api.get(`/users/export${params}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data-anggota-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Data berhasil diexport!');
        } catch {
            toast.error('Gagal mengexport data');
        }
    };

    // Download import template
    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/users/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template-import-anggota.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error('Gagal mendownload template');
        }
    };

    // Import users from Excel
    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) {
            toast.error('Pilih file Excel terlebih dahulu');
            return;
        }

        setIsImporting(true);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', importFile);

            const response = await api.post<ApiResponse<{ success: number; failed: number; errors: string[] }>>('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setImportResult(response.data.data);
            toast.success(response.data.message || 'Import selesai!');
            fetchUsers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal mengimport data');
        } finally {
            setIsImporting(false);
        }
    };

    const closeImportModal = () => {
        setIsImportOpen(false);
        setImportFile(null);
        setImportResult(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600">Kelola data pengguna sistem</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        Tambah User
                    </button>
                    <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
                        <Download size={18} />
                        Export Excel
                    </button>
                    <button onClick={() => setIsImportOpen(true)} className="btn btn-secondary flex items-center gap-2">
                        <Upload size={18} />
                        Import Excel
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari nama atau email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Cari
                    </button>
                </form>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => { setSelectedRoleId('all'); setPage(1); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedRoleId === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Semua
                </button>
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => { setSelectedRoleId(role.id); setPage(1); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${selectedRoleId === role.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {role.name}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akademik</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role & Dept</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data user
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.nim || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{user.prodi || '-'}</div>
                                            <div className="text-sm text-gray-500">
                                                {user.fakultas ? `${user.fakultas} ` : ''}
                                                {user.angkatan ? `(${user.angkatan})` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                                                    {user.roleName || user.role || '-'}
                                                </span>
                                                {user.departemenName && (
                                                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                                        {user.departemenName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`flex items-center gap-1 text-sm ${user.isActive ? 'text-green-600' : 'text-gray-400'
                                                    }`}
                                            >
                                                {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeletingUser(user);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Tambah User'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                            <input
                                type="text"
                                value={form.nim}
                                onChange={(e) => setForm({ ...form, nim: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                            <input
                                type="text"
                                value={form.fakultas}
                                onChange={(e) => setForm({ ...form, fakultas: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Contoh: Teknik"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prodi</label>
                            <input
                                type="text"
                                value={form.prodi}
                                onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Contoh: S1 Informatika"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                            <input
                                type="text"
                                value={form.angkatan}
                                onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Contoh: 2024"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={form.roleId}
                                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Pilih Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                            <select
                                value={form.departemenId}
                                onChange={(e) => setForm({ ...form, departemenId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Pilih Departemen</option>
                                {departemens.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password {editingUser ? '(kosongkan jika tidak diubah)' : '*'}
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required={!editingUser}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary"
                        >
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                message={`Apakah Anda yakin ingin menghapus user "${deletingUser?.name}"?`}
            />

            {/* Import Modal */}
            <Modal isOpen={isImportOpen} onClose={closeImportModal} title="Import Data Anggota" size="lg">
                <div className="space-y-6">
                    {/* Panduan */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <HelpCircle size={20} className="text-blue-600 mt-0.5" />
                            <div className="text-sm">
                                <h4 className="font-semibold text-blue-800 mb-2">Panduan Import</h4>
                                <ol className="list-decimal list-inside text-blue-700 space-y-1">
                                    <li>Download template terlebih dahulu</li>
                                    <li>Isi data sesuai kolom yang tersedia</li>
                                    <li>Kolom <strong>Email</strong> dan <strong>Nama</strong> wajib diisi</li>
                                    <li>Kolom <strong>Role</strong>: admin, pengurus, anggota, bendahara</li>
                                    <li>Jika Password kosong, default: <code className="bg-blue-100 px-1 rounded">password123</code></li>
                                    <li>Simpan file dan upload</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Download Template Button */}
                    <button
                        onClick={handleDownloadTemplate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <FileSpreadsheet size={20} className="text-gray-500" />
                        <span className="font-medium text-gray-700">Download Template Excel</span>
                    </button>

                    {/* Upload Form */}
                    <form onSubmit={handleImport} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih File Excel *
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {importFile && (
                                <p className="text-sm text-gray-500 mt-1">
                                    File terpilih: {importFile.name}
                                </p>
                            )}
                        </div>

                        {/* Import Result */}
                        {importResult && (
                            <div className={`p-4 rounded-lg ${importResult.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                                <h4 className="font-semibold mb-2">Hasil Import:</h4>
                                <div className="flex gap-4 mb-2">
                                    <span className="text-green-700">✓ Berhasil: {importResult.success}</span>
                                    <span className="text-red-700">✗ Gagal: {importResult.failed}</span>
                                </div>
                                {importResult.errors.length > 0 && (
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        <p className="text-sm font-medium text-red-700 mb-1">Error:</p>
                                        <ul className="text-sm text-red-600 list-disc list-inside">
                                            {importResult.errors.slice(0, 10).map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                            {importResult.errors.length > 10 && (
                                                <li>...dan {importResult.errors.length - 10} error lainnya</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button type="button" onClick={closeImportModal} className="btn btn-secondary">
                                Tutup
                            </button>
                            <button type="submit" disabled={isImporting || !importFile} className="btn btn-primary flex items-center gap-2">
                                <Upload size={18} />
                                {isImporting ? 'Mengimport...' : 'Import Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
