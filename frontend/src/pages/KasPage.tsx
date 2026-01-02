import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, Kas } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import toast from 'react-hot-toast';

export function KasPage() {
    const [data, setData] = useState<Kas[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Kas | null>(null);
    const [deletingItem, setDeletingItem] = useState<Kas | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        periode: '',
        saldoAwal: '',
        description: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<Kas[]>>('/kas');
            setData(res.data.data);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ periode: '', saldoAwal: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Kas) => {
        setEditingItem(item);
        setForm({
            periode: item.periode,
            saldoAwal: item.saldoAwal,
            description: item.description || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingItem) {
                await api.put(`/kas/${editingItem.id}`, form);
                toast.success('Kas berhasil diperbarui');
            } else {
                await api.post('/kas', form);
                toast.success('Kas berhasil ditambahkan');
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
            await api.delete(`/kas/${deletingItem.id}`);
            toast.success('Kas berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const setActive = async (kas: Kas) => {
        try {
            await api.put(`/kas/${kas.id}`, { isActive: true });
            toast.success('Kas diaktifkan');
            fetchData();
        } catch {
            toast.error('Gagal mengaktifkan kas');
        }
    };

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(value) || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kas</h1>
                    <p className="text-gray-600">Kelola periode kas organisasi</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Tambah Periode
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Tidak ada data kas
                    </div>
                ) : (
                    data.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow-sm p-6 border-2 ${item.isActive ? 'border-green-500' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">{item.periode}</h3>
                                    <p className="text-sm text-gray-500">{item.description || 'Tidak ada deskripsi'}</p>
                                </div>
                                {item.isActive && (
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                        <CheckCircle size={12} /> Aktif
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Saldo Awal</span>
                                    <span className="font-medium">{formatCurrency(item.saldoAwal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Saldo Akhir</span>
                                    <span className="font-bold text-lg text-green-600">{formatCurrency(item.saldoAkhir)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                {!item.isActive && (
                                    <button
                                        onClick={() => setActive(item)}
                                        className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                                    >
                                        Set Aktif
                                    </button>
                                )}
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Kas' : 'Tambah Kas'}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Awal *</label>
                        <input
                            type="number"
                            value={form.saldoAwal}
                            onChange={(e) => setForm({ ...form, saldoAwal: e.target.value })}
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
                message={`Hapus kas periode "${deletingItem?.periode}"?`}
            />
        </div>
    );
}
