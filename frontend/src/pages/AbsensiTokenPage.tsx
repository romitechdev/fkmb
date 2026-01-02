import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2, QrCode } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, AbsensiToken, Kegiatan } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import toast from 'react-hot-toast';

export function AbsensiTokenPage() {
    const [data, setData] = useState<AbsensiToken[]>([]);
    const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQROpen, setIsQROpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedQR, setSelectedQR] = useState<AbsensiToken | null>(null);
    const [deletingItem, setDeletingItem] = useState<AbsensiToken | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        kegiatanId: '',
        label: '',
        expiresAt: '',
    });

    useEffect(() => {
        fetchData();
        fetchKegiatan();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<AbsensiToken[]>>('/absensi-token');
            setData(res.data.data);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchKegiatan = async () => {
        try {
            const res = await api.get<ApiResponse<Kegiatan[]>>('/kegiatan?limit=100');
            setKegiatan(res.data.data);
        } catch {
            console.error('Failed to fetch kegiatan');
        }
    };

    const openCreateModal = () => {
        setForm({ kegiatanId: '', label: '', expiresAt: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await api.post('/absensi-token', form);
            toast.success('Token berhasil dibuat');
            setIsModalOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal membuat token');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerate = async (token: AbsensiToken) => {
        try {
            await api.post(`/absensi-token/${token.id}/regenerate-qr`);
            toast.success('QR Code berhasil di-regenerate');
            fetchData();
        } catch {
            toast.error('Gagal regenerate QR');
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setIsSaving(true);

        try {
            await api.delete(`/absensi-token/${deletingItem.id}`);
            toast.success('Token berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('id-ID');
    };

    const isExpired = (date: string) => new Date(date) < new Date();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Absensi Token</h1>
                    <p className="text-gray-600">Kelola QR Code untuk absensi kegiatan</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Generate QR
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
                        Tidak ada token absensi
                    </div>
                ) : (
                    data.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{item.kegiatanName || 'Kegiatan'}</h3>
                                    {item.label && (
                                        <p className="text-sm font-medium text-blue-600 mt-0.5">{item.label}</p>
                                    )}
                                    <p className={`text-sm ${isExpired(item.expiresAt) ? 'text-red-500' : 'text-gray-500'}`}>
                                        {isExpired(item.expiresAt) ? 'Expired: ' : 'Expires: '}
                                        {formatDate(item.expiresAt)}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${item.isActive && !isExpired(item.expiresAt)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.isActive && !isExpired(item.expiresAt) ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* QR Preview */}
                            <div
                                className="bg-gray-50 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => { setSelectedQR(item); setIsQROpen(true); }}
                            >
                                {item.qrCode ? (
                                    <img src={item.qrCode} alt="QR Code" className="w-full max-w-[150px] mx-auto" />
                                ) : (
                                    <div className="flex items-center justify-center h-32">
                                        <QrCode size={48} className="text-gray-300" />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRegenerate(item)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                >
                                    <RefreshCw size={16} />
                                    Regenerate
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

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate QR Token">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan *</label>
                        <select
                            value={form.kegiatanId}
                            onChange={(e) => setForm({ ...form, kegiatanId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Pilih Kegiatan</option>
                            {kegiatan.map((k) => (
                                <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Pertemuan</label>
                        <input
                            type="text"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            placeholder="Contoh: Rapat 1, Day 1, Pertemuan Pembukaan"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Opsional. Membantu identifikasi saat rekap absensi</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expired At *</label>
                        <input
                            type="datetime-local"
                            value={form.expiresAt}
                            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* QR View Modal */}
            <Modal isOpen={isQROpen} onClose={() => setIsQROpen(false)} title="QR Code" size="sm">
                <div className="text-center">
                    {selectedQR?.qrCode && (
                        <img src={selectedQR.qrCode} alt="QR Code" className="w-full max-w-[250px] mx-auto" />
                    )}
                    {selectedQR?.label && (
                        <p className="mt-3 text-lg font-semibold text-blue-600">{selectedQR.label}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">{selectedQR?.kegiatanName}</p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Token untuk input manual:</p>
                        <code className="text-2xl font-mono font-bold tracking-widest text-gray-800">
                            {selectedQR?.token}
                        </code>
                    </div>
                </div>
            </Modal>

            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                message="Hapus token absensi ini?"
            />
        </div>
    );
}
