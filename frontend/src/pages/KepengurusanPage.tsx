import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, Kepengurusan, User, Departemen } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export function KepengurusanPage() {
    const [data, setData] = useState<Kepengurusan[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [departemen, setDepartemen] = useState<Departemen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Kepengurusan | null>(null);
    const [deletingItem, setDeletingItem] = useState<Kepengurusan | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        userId: '',
        departemenId: '',
        jabatan: '',
        periode: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchData();
        fetchUsers();
        fetchDepartemen();
    }, [page]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<Kepengurusan[]>>(`/kepengurusan?page=${page}&limit=10`);
            setData(res.data.data);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get<ApiResponse<User[]>>('/users?limit=100');
            setUsers(res.data.data);
        } catch {
            console.error('Failed to fetch users');
        }
    };

    const fetchDepartemen = async () => {
        try {
            const res = await api.get<ApiResponse<Departemen[]>>('/departemen?limit=100');
            setDepartemen(res.data.data);
        } catch {
            console.error('Failed to fetch departemen');
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ userId: '', departemenId: '', jabatan: '', periode: '', startDate: '', endDate: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Kepengurusan) => {
        setEditingItem(item);
        setForm({
            userId: item.userId,
            departemenId: item.departemenId,
            jabatan: item.jabatan,
            periode: item.periode,
            startDate: item.startDate?.split('T')[0] || '',
            endDate: item.endDate?.split('T')[0] || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingItem) {
                await api.put(`/kepengurusan/${editingItem.id}`, form);
                toast.success('Data berhasil diperbarui');
            } else {
                await api.post('/kepengurusan', form);
                toast.success('Data berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal menyimpan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setIsSaving(true);

        try {
            await api.delete(`/kepengurusan/${deletingItem.id}`);
            toast.success('Data berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kepengurusan</h1>
                    <p className="text-gray-600">Kelola data kepengurusan organisasi</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Tambah
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.userName || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.departemenName || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.jabatan}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.periode}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
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
                <div className="px-6 py-4 border-t">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Kepengurusan' : 'Tambah Kepengurusan'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
                            <select
                                value={form.userId}
                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Pilih User</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departemen *</label>
                            <select
                                value={form.departemenId}
                                onChange={(e) => setForm({ ...form, departemenId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Pilih Departemen</option>
                                {departemen.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan *</label>
                            <input
                                type="text"
                                value={form.jabatan}
                                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periode *</label>
                            <input
                                type="text"
                                value={form.periode}
                                onChange={(e) => setForm({ ...form, periode: e.target.value })}
                                placeholder="2024/2025"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
            />
        </div>
    );
}
