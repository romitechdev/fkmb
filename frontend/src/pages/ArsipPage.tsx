import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Trash2, FileText, Download, Eye } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { ApiResponse, Arsip, Departemen } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export function ArsipPage() {
    const { hasRole } = useAuth();
    const canManage = hasRole('admin', 'pengurus');

    const [data, setData] = useState<Arsip[]>([]);
    const [departemen, setDepartemen] = useState<Departemen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState<Arsip | null>(null);
    const [deletingItem, setDeletingItem] = useState<Arsip | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        departemenId: '',
        file: null as File | null,
    });

    useEffect(() => {
        fetchData();
        fetchDepartemen();
    }, [page, categoryFilter, search]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            let url = `/arsip?page=${page}&limit=12`;
            if (categoryFilter) url += `&category=${categoryFilter}`;
            if (search) url += `&search=${search}`;
            const res = await api.get<ApiResponse<Arsip[]>>(url);
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
        setForm({ title: '', description: '', category: '', departemenId: '', file: null });
        setIsModalOpen(true);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.file) {
            toast.error('Pilih file untuk diupload');
            return;
        }
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('file', form.file);
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            if (form.departemenId) {
                formData.append('departemenId', form.departemenId);
            }

            await api.post('/arsip', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Arsip berhasil diupload');
            setIsModalOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal upload arsip');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setIsSaving(true);

        try {
            await api.delete(`/arsip/${deletingItem.id}`);
            toast.success('Arsip berhasil dihapus');
            setIsDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImage = (type: string) => type?.startsWith('image/');

    const categories = ['proposal', 'lpj', 'surat', 'dokumentasi', 'lainnya'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Arsip</h1>
                    <p className="text-gray-600">Kelola dokumen dan file organisasi</p>
                </div>
                {canManage && (
                    <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        Upload Arsip
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari arsip..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Cari</button>
                </form>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setCategoryFilter(''); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm ${!categoryFilter ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Semua
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setCategoryFilter(cat); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Tidak ada arsip
                    </div>
                ) : (
                    data.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                            {/* Preview */}
                            <div
                                className="h-32 bg-gray-100 flex items-center justify-center cursor-pointer relative"
                                onClick={() => { setPreviewItem(item); setIsPreviewOpen(true); }}
                            >
                                {isImage(item.fileType) ? (
                                    <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <FileText size={48} className="text-gray-300" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={24} className="text-white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 text-xs bg-gray-100 rounded capitalize">{item.category || 'lainnya'}</span>
                                    <span className="text-xs text-gray-500">{formatFileSize(item.fileSize)}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 truncate">{item.departemenName || '-'}</p>
                            </div>

                            {/* Actions */}
                            <div className="px-4 pb-4 flex gap-2">
                                <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                                >
                                    <Download size={14} />
                                    Download
                                </a>
                                {canManage && (
                                    <button
                                        onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

            {/* Upload Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Arsip" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c} value={c} className="capitalize">{c}</option>
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
                                {departemen.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={previewItem?.title || 'Preview'} size="lg">
                <div className="text-center">
                    {previewItem && isImage(previewItem.fileType) ? (
                        <img src={previewItem.fileUrl} alt={previewItem.title} className="max-w-full max-h-96 mx-auto rounded-lg" />
                    ) : (
                        <div className="py-12">
                            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Preview tidak tersedia untuk tipe file ini</p>
                        </div>
                    )}
                    {previewItem && (
                        <a
                            href={previewItem.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download size={16} />
                            Download File
                        </a>
                    )}
                </div>
            </Modal>

            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                message={`Hapus arsip "${deletingItem?.title}"?`}
            />
        </div>
    );
}
