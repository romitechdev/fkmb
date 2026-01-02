import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, Kegiatan, Departemen } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed', 'cancelled'];
const TYPE_OPTIONS = ['rapat', 'kegiatan', 'pelatihan', 'lainnya'];

const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
};

export function KegiatanPage() {
    const [data, setData] = useState<Kegiatan[]>([]);
    const [departemen, setDepartemen] = useState<Departemen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Kegiatan | null>(null);
    const [deletingItem, setDeletingItem] = useState<Kegiatan | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        type: 'kegiatan',
        status: 'upcoming',
        departemenId: '',
    });

    useEffect(() => {
        fetchData();
        fetchDepartemen();
    }, [page, statusFilter]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            let url = `/kegiatan?page=${page}&limit=10`;
            if (statusFilter) url += `&status=${statusFilter}`;
            const res = await api.get<ApiResponse<Kegiatan[]>>(url);
            setData(res.data.data);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
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
        setForm({
            name: '', description: '', location: '', startDate: '', endDate: '',
            type: 'kegiatan', status: 'upcoming', departemenId: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Kegiatan) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            description: item.description || '',
            location: item.location || '',
            startDate: item.startDate?.slice(0, 16) || '',
            endDate: item.endDate?.slice(0, 16) || '',
            type: item.type,
            status: item.status,
            departemenId: item.departemenId || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingItem) {
                await api.put(`/kegiatan/${editingItem.id}`, form);
                toast.success('Kegiatan berhasil diperbarui');
            } else {
                await api.post('/kegiatan', form);
                toast.success('Kegiatan berhasil ditambahkan');
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
            await api.delete(`/kegiatan/${deletingItem.id}`);
            toast.success('Kegiatan berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kegiatan</h1>
                    <p className="text-gray-600">Kelola kegiatan dan event organisasi</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Tambah Kegiatan
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setStatusFilter(''); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Semua
                    </button>
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.departemenName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(item.startDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{item.location || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-gray-100 rounded capitalize">{item.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[item.status]}`}>
                                                {item.status}
                                            </span>
                                        </td>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Kegiatan' : 'Tambah Kegiatan'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan *</label>
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
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                            <select
                                value={form.departemenId}
                                onChange={(e) => setForm({ ...form, departemenId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Pilih Departemen</option>
                                {departemen.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                            <input
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                            <input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                {TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t} className="capitalize">{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="capitalize">{s}</option>
                                ))}
                            </select>
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
                message={`Hapus kegiatan "${deletingItem?.name}"?`}
            />
        </div>
    );
}
