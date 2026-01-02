import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, Departemen, User } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

interface DepartemenMembersData {
    departemen: { id: string; name: string };
    members: Array<User & { roleName?: string }>;
    totalMembers: number;
}

export function DepartemenPage() {
    const [data, setData] = useState<Departemen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Departemen | null>(null);
    const [deletingItem, setDeletingItem] = useState<Departemen | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({ name: '', description: '' });

    // Members modal state
    const [membersData, setMembersData] = useState<DepartemenMembersData | null>(null);
    const [isMembersLoading, setIsMembersLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [page, search]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<Departemen[]>>(`/departemen?page=${page}&limit=10&search=${search}`);
            setData(res.data.data);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data departemen');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Departemen) => {
        setEditingItem(item);
        setForm({ name: item.name, description: item.description || '' });
        setIsModalOpen(true);
    };

    const openMembersModal = async (item: Departemen) => {
        setIsMembersOpen(true);
        setIsMembersLoading(true);
        try {
            const res = await api.get<ApiResponse<DepartemenMembersData>>(`/departemen/${item.id}/members`);
            setMembersData(res.data.data);
        } catch {
            toast.error('Gagal memuat anggota departemen');
            setIsMembersOpen(false);
        } finally {
            setIsMembersLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingItem) {
                await api.put(`/departemen/${editingItem.id}`, form);
                toast.success('Departemen berhasil diperbarui');
            } else {
                await api.post('/departemen', form);
                toast.success('Departemen berhasil ditambahkan');
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
            await api.delete(`/departemen/${deletingItem.id}`);
            toast.success('Departemen berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-red-100 text-red-700',
        pengurus: 'bg-blue-100 text-blue-700',
        bendahara: 'bg-green-100 text-green-700',
        anggota: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departemen</h1>
                    <p className="text-gray-600">Kelola data departemen organisasi</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Tambah Departemen
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari departemen..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Cari</button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.description || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openMembersModal(item)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                title="Lihat Anggota"
                                            >
                                                <Users size={16} />
                                            </button>
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
                <div className="px-6 py-4 border-t">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Departemen' : 'Tambah Departemen'}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Members Modal */}
            <Modal
                isOpen={isMembersOpen}
                onClose={() => { setIsMembersOpen(false); setMembersData(null); }}
                title={`Anggota ${membersData?.departemen.name || 'Departemen'}`}
                size="lg"
            >
                {isMembersLoading ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Memuat data...</p>
                    </div>
                ) : membersData ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-600">Total Anggota:</span>
                            <span className="font-bold text-lg text-blue-600">{membersData.totalMembers}</span>
                        </div>

                        {membersData.members.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <Users size={48} className="mx-auto mb-2 text-gray-300" />
                                <p>Belum ada anggota di departemen ini</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIM</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Angkatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {membersData.members.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">{member.nim || '-'}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${roleColors[member.roleName || 'anggota'] || roleColors.anggota}`}>
                                                        {member.roleName || 'anggota'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">{member.angkatan || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : null}
            </Modal>

            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                message={`Hapus departemen "${deletingItem?.name}"?`}
            />
        </div>
    );
}
