import { useEffect, useState } from 'react';
import { Plus, Trash2, FileText, Download } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, LaporanKas, Kas } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export function LaporanKasPage() {
    const [data, setData] = useState<LaporanKas[]>([]);
    const [kasList, setKasList] = useState<Kas[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<LaporanKas | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        kasId: '',
        periode: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchData();
        fetchKas();
    }, [page]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<LaporanKas[]>>(`/laporan-kas?page=${page}&limit=10`);
            setData(res.data.data);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
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

    const openCreateModal = () => {
        setForm({ kasId: '', periode: '', startDate: '', endDate: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await api.post('/laporan-kas', form);
            toast.success('Laporan berhasil dibuat');
            setIsModalOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal membuat laporan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setIsSaving(true);

        try {
            await api.delete(`/laporan-kas/${deletingItem.id}`);
            toast.success('Laporan berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
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

    const chartData = data.map((item) => ({
        name: item.periode,
        Pemasukan: parseFloat(item.totalPemasukan) || 0,
        Pengeluaran: parseFloat(item.totalPengeluaran) || 0,
    }));

    // Export laporan to Excel
    const handleExportLaporan = async (id: string, periode: string) => {
        try {
            const response = await api.get(`/laporan-kas/export/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan-kas-${periode.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Laporan berhasil diexport!');
        } catch {
            toast.error('Gagal mengexport laporan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan Kas</h1>
                    <p className="text-gray-600">Generate dan kelola laporan keuangan</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Generate Laporan
                </button>
            </div>

            {/* Chart */}
            {data.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Grafik Keuangan</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(String(value))} />
                                <Legend />
                                <Bar dataKey="Pemasukan" fill="#10B981" />
                                <Bar dataKey="Pengeluaran" fill="#EF4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kas</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pemasukan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pengeluaran</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo Akhir</th>
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Belum ada laporan</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-gray-400" />
                                                <span className="font-medium text-gray-900">{item.periode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{item.kasPeriode || '-'}</td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium">
                                            +{formatCurrency(item.totalPemasukan)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-red-600 font-medium">
                                            -{formatCurrency(item.totalPengeluaran)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            {formatCurrency(item.saldoAkhir)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleExportLaporan(item.id, item.periode)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Export Excel"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Hapus"
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Laporan">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kas Periode *</label>
                        <select
                            value={form.kasId}
                            onChange={(e) => setForm({ ...form, kasId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Pilih Kas</option>
                            {kasList.map((k) => (
                                <option key={k.id} value={k.id}>{k.periode}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Periode Laporan *</label>
                        <input
                            type="text"
                            value={form.periode}
                            onChange={(e) => setForm({ ...form, periode: e.target.value })}
                            placeholder="Januari 2024"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir *</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                message={`Hapus laporan "${deletingItem?.periode}"?`}
            />
        </div>
    );
}
