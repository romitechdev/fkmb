import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, KasDetail, Kas } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export function KasDetailPage() {
    const [data, setData] = useState<KasDetail[]>([]);
    const [kasList, setKasList] = useState<Kas[]>([]);
    const [activeKas, setActiveKas] = useState<Kas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [jenisFilter, setJenisFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KasDetail | null>(null);
    const [deletingItem, setDeletingItem] = useState<KasDetail | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        kasId: '',
        tanggal: '',
        jenis: 'pemasukan',
        kategori: '',
        description: '',
        jumlah: '',
    });

    useEffect(() => {
        fetchKas();
        fetchActiveKas();
    }, []);

    useEffect(() => {
        fetchData();
    }, [page, jenisFilter]);

    const fetchActiveKas = async () => {
        try {
            const res = await api.get<ApiResponse<Kas>>('/kas/active');
            setActiveKas(res.data.data);
        } catch {
            console.error('No active kas');
        }
    };

    const fetchKas = async () => {
        try {
            const res = await api.get<ApiResponse<Kas[]>>('/kas');
            setKasList(res.data.data);
        } catch {
            console.error('Failed to fetch kas');
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            let url = `/kas-detail?page=${page}&limit=10`;
            if (jenisFilter) url += `&jenis=${jenisFilter}`;
            const res = await api.get<ApiResponse<{ transactions: KasDetail[], summary: any }>>(url);
            setData(res.data.data.transactions);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({
            kasId: activeKas?.id || '',
            tanggal: new Date().toISOString().split('T')[0],
            jenis: 'pemasukan',
            kategori: '',
            description: '',
            jumlah: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: KasDetail) => {
        setEditingItem(item);
        setForm({
            kasId: item.kasId,
            tanggal: item.tanggal?.split('T')[0] || '',
            jenis: item.jenis,
            kategori: item.kategori || '',
            description: item.description,
            jumlah: item.jumlah,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingItem) {
                await api.put(`/kas-detail/${editingItem.id}`, form);
                toast.success('Transaksi berhasil diperbarui');
            } else {
                await api.post('/kas-detail', form);
                toast.success('Transaksi berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchData();
            fetchActiveKas();
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
            await api.delete(`/kas-detail/${deletingItem.id}`);
            toast.success('Transaksi berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
            fetchActiveKas();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(value) || 0);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transaksi Kas</h1>
                    <p className="text-gray-600">
                        {activeKas ? `Periode: ${activeKas.periode} | Saldo: ${formatCurrency(activeKas.saldoAkhir)}` : 'Tidak ada kas aktif'}
                    </p>
                </div>
                <button onClick={openCreateModal} disabled={!activeKas} className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
                    <Plus size={18} />
                    Tambah Transaksi
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setJenisFilter(''); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm ${!jenisFilter ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => { setJenisFilter('pemasukan'); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${jenisFilter === 'pemasukan' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                    >
                        <ArrowUpCircle size={14} /> Pemasukan
                    </button>
                    <button
                        onClick={() => { setJenisFilter('pengeluaran'); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${jenisFilter === 'pengeluaran' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                    >
                        <ArrowDownCircle size={14} /> Pengeluaran
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Tidak ada transaksi</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">{formatDate(item.tanggal)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${item.jenis === 'pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.jenis === 'pemasukan' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                                                {item.jenis}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{item.kategori || '-'}</td>
                                        <td className="px-6 py-4 text-gray-900">{item.description}</td>
                                        <td className={`px-6 py-4 text-right font-medium ${item.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {item.jenis === 'pemasukan' ? '+' : '-'}{formatCurrency(item.jumlah)}
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Transaksi' : 'Tambah Transaksi'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kas Periode *</label>
                            <select
                                value={form.kasId}
                                onChange={(e) => setForm({ ...form, kasId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Pilih Periode</option>
                                {kasList.map((k) => (
                                    <option key={k.id} value={k.id}>{k.periode}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                            <input
                                type="date"
                                value={form.tanggal}
                                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis *</label>
                            <select
                                value={form.jenis}
                                onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="pemasukan">Pemasukan</option>
                                <option value="pengeluaran">Pengeluaran</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <input
                                type="text"
                                value={form.kategori}
                                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                                placeholder="Iuran, Konsumsi, dll"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
                        <input
                            type="number"
                            value={form.jumlah}
                            onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
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

            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
            />
        </div>
    );
}
