import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Filter, QrCode, Send, Camera, X, CheckCircle, ClipboardCheck, Download } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { ApiResponse, Absensi, Kegiatan, User } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['hadir', 'izin', 'sakit', 'alpha'];

const statusColors: Record<string, string> = {
    hadir: 'bg-green-100 text-green-700',
    izin: 'bg-yellow-100 text-yellow-700',
    sakit: 'bg-orange-100 text-orange-700',
    alpha: 'bg-red-100 text-red-700',
};

interface ScanResult {
    success: boolean;
    userName?: string;
    kegiatanName?: string;
    tokenLabel?: string;
    time?: string;
}

export function AbsensiPage() {
    const { user, hasRole } = useAuth();
    const canManage = hasRole('admin', 'pengurus');

    const [data, setData] = useState<Absensi[]>([]);
    const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [kegiatanFilter, setKegiatanFilter] = useState('');
    const [pertemuanFilter, setPertemuanFilter] = useState('');
    const [pertemuanOptions, setPertemuanOptions] = useState<string[]>([]);

    // Scan mode
    const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
    const [tokenInput, setTokenInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    // QR Scanner ref
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    // Admin modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Absensi | null>(null);
    const [deletingItem, setDeletingItem] = useState<Absensi | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // User search for manual entry
    const [userSearchInput, setUserSearchInput] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const [form, setForm] = useState({
        userId: '',
        kegiatanId: '',
        status: 'hadir',
        tokenLabel: '',
        note: '',
    });

    // Filter users based on search input
    const filteredUsers = users.filter((u) => {
        if (!userSearchInput || userSearchInput.length < 1) return true;
        const search = userSearchInput.toLowerCase().trim();
        const nameMatch = u.name?.toLowerCase().includes(search);
        const nimMatch = u.nim?.toLowerCase().includes(search);
        const emailMatch = u.email?.toLowerCase().includes(search);
        return nameMatch || nimMatch || emailMatch;
    });

    useEffect(() => {
        if (canManage) {
            fetchKegiatan();
            fetchUsers();
        }
    }, [canManage]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchMyAbsensi();
        }
    }, [activeTab, page]);

    useEffect(() => {
        if (canManage && kegiatanFilter) {
            fetchAbsensiByKegiatan();
        }
    }, [kegiatanFilter, pertemuanFilter, page]);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const fetchKegiatan = async () => {
        try {
            const res = await api.get<ApiResponse<Kegiatan[]>>('/kegiatan?limit=100');
            setKegiatan(res.data.data);
        } catch {
            console.error('Failed to fetch kegiatan');
        }
    };

    const fetchUsers = async () => {
        try {
            // Fetch all users for dropdown (no pagination limit for selection)
            const res = await api.get<ApiResponse<User[]>>('/users?limit=1000');
            setUsers(res.data.data);
        } catch {
            console.error('Failed to fetch users');
        }
    };

    const fetchMyAbsensi = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<Absensi[]>>(`/absensi/user/${user?.id}?page=${page}&limit=10`);
            setData(res.data.data);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch {
            toast.error('Gagal memuat data absensi');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAbsensiByKegiatan = async () => {
        try {
            setIsLoading(true);
            // Fetch all data for this kegiatan to get pertemuan options (limit higher)
            const res = await api.get<ApiResponse<Absensi[]>>(`/absensi/kegiatan/${kegiatanFilter}?page=1&limit=1000`);
            const allData = res.data.data;

            // Extract unique pertemuan labels
            const labels = [...new Set(allData.map(a => a.tokenLabel).filter(Boolean))] as string[];
            setPertemuanOptions(labels.sort());

            // Filter by pertemuan if selected
            let filteredData = allData;
            if (pertemuanFilter) {
                filteredData = allData.filter(a => a.tokenLabel === pertemuanFilter);
            }

            // Manual pagination
            const startIndex = (page - 1) * 10;
            const paginatedData = filteredData.slice(startIndex, startIndex + 10);

            setData(paginatedData);
            setTotalPages(Math.ceil(filteredData.length / 10) || 1);
        } catch {
            toast.error('Gagal memuat data absensi');
        } finally {
            setIsLoading(false);
        }
    };

    // Start camera for QR scanning
    const startCamera = async () => {
        setShowCamera(true);
        setScanResult(null);

        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            // Check if scanner already exists
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch {
                    // Ignore stop errors
                }
            }

            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1,
            };

            // Try back camera first, fallback to front camera
            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        handleScanToken(decodedText);
                        stopCamera();
                    },
                    () => { /* Ignore scan errors */ }
                );
            } catch (backCameraError) {
                console.log('Back camera failed, trying front camera:', backCameraError);
                // Try front camera
                await scanner.start(
                    { facingMode: 'user' },
                    config,
                    (decodedText) => {
                        handleScanToken(decodedText);
                        stopCamera();
                    },
                    () => { /* Ignore scan errors */ }
                );
            }
        } catch (error) {
            console.error('Camera error:', error);
            toast.error('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan dan tidak ada aplikasi lain yang menggunakan kamera.');
            setShowCamera(false);
            scannerRef.current = null;
        }
    };

    const stopCamera = async () => {
        setShowCamera(false);
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2) { // SCANNING
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (e) {
                console.error('Error stopping scanner:', e);
            }
            scannerRef.current = null;
        }
    };

    // Scan token for attendance
    const handleScanToken = async (scannedData: string) => {
        if (!scannedData.trim()) {
            toast.error('Masukkan token absensi');
            return;
        }

        // Try to parse as JSON (from QR code) or use as plain token
        let token = scannedData.trim();
        try {
            const parsed = JSON.parse(scannedData);
            if (parsed.token) {
                token = parsed.token;
            }
        } catch {
            // Not JSON, use as plain token
        }

        setIsScanning(true);
        setScanResult(null);
        try {
            const res = await api.post<ApiResponse<Absensi & { kegiatanName?: string; tokenLabel?: string }>>('/absensi/scan', { token });
            const absensiData = res.data.data;

            setScanResult({
                success: true,
                userName: user?.name,
                kegiatanName: absensiData.kegiatanName || 'Kegiatan',
                tokenLabel: absensiData.tokenLabel,
                time: new Date().toLocaleString('id-ID'),
            });
            setTokenInput('');
            toast.success('Absensi berhasil dicatat!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Token tidak valid atau sudah kadaluarsa';
            toast.error(message);
            setScanResult({
                success: false,
            });
        } finally {
            setIsScanning(false);
        }
    };

    const handleTokenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScanToken(tokenInput);
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ userId: '', kegiatanId: kegiatanFilter, status: 'hadir', tokenLabel: '', note: '' });
        setUserSearchInput('');
        setShowUserDropdown(false);
        setIsModalOpen(true);
    };

    const openEditModal = (item: Absensi) => {
        setEditingItem(item);
        setForm({
            userId: item.userId,
            kegiatanId: item.kegiatanId,
            status: item.status,
            tokenLabel: item.tokenLabel || '',
            note: item.note || '',
        });
        setUserSearchInput(item.userName || '');
        setShowUserDropdown(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingItem) {
                await api.put(`/absensi/${editingItem.id}`, form);
                toast.success('Absensi berhasil diperbarui');
            } else {
                await api.post('/absensi/manual', form);
                toast.success('Absensi berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchAbsensiByKegiatan();
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
            await api.delete(`/absensi/${deletingItem.id}`);
            toast.success('Absensi berhasil dihapus');
            setIsDeleteOpen(false);
            fetchAbsensiByKegiatan();
        } catch {
            toast.error('Gagal menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleString('id-ID');
    };

    // Export absensi to Excel
    const handleExportAbsensi = async () => {
        if (!kegiatanFilter) {
            toast.error('Pilih kegiatan terlebih dahulu');
            return;
        }
        try {
            const response = await api.get(`/absensi/export/${kegiatanFilter}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `absensi-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Data absensi berhasil diexport!');
        } catch {
            toast.error('Gagal mengexport data');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
                    <p className="text-gray-600">Scan QR atau masukkan token untuk absensi</p>
                </div>
            </div>

            {/* Tabs - Mobile Responsive */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => { setActiveTab('scan'); stopCamera(); }}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'scan'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <QrCode size={18} />
                    <span>Absen Sekarang</span>
                </button>
                <button
                    onClick={() => { setActiveTab('history'); stopCamera(); }}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'history'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <ClipboardCheck size={18} />
                    <span>Riwayat</span>
                </button>
            </div>

            {/* Scan Tab */}
            {activeTab === 'scan' && (
                <div className="space-y-6">
                    {/* Success Result */}
                    {scanResult?.success && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Absensi Berhasil!</h3>
                            <p className="text-green-700 font-medium">{scanResult.userName}</p>
                            <p className="text-green-600 text-sm">{scanResult.kegiatanName}</p>
                            {scanResult.tokenLabel && (
                                <p className="text-blue-600 text-sm font-medium mt-1">{scanResult.tokenLabel}</p>
                            )}
                            <p className="text-green-500 text-xs mt-2">{scanResult.time}</p>
                            <button
                                onClick={() => setScanResult(null)}
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Absen Lagi
                            </button>
                        </div>
                    )}

                    {!scanResult?.success && (
                        <>
                            {/* Camera Scanner */}
                            {showCamera ? (
                                <div className="bg-gray-900 rounded-2xl overflow-hidden relative">
                                    <div
                                        id="qr-reader"
                                        ref={scannerContainerRef}
                                        className="w-full"
                                        style={{ minHeight: '300px' }}
                                    />
                                    <div className="p-4 bg-gray-800 flex justify-center">
                                        <button
                                            onClick={stopCamera}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
                                        >
                                            <X size={18} />
                                            Tutup Kamera
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-white/20 rounded-xl">
                                            <Camera size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold">Scan dengan Kamera</h2>
                                            <p className="text-blue-100 text-sm">Arahkan kamera ke QR Code</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startCamera}
                                        className="w-full py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Camera size={20} />
                                        Buka Kamera
                                    </button>
                                </div>
                            )}

                            {/* Token Input - Mobile Optimized */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl">
                                        <QrCode size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Masukkan Token</h2>
                                        <p className="text-xs sm:text-sm text-gray-500">Ketik kode token secara manual</p>
                                    </div>
                                </div>
                                <form onSubmit={handleTokenSubmit} className="space-y-3">
                                    <input
                                        type="text"
                                        value={tokenInput}
                                        onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                                        placeholder="Masukkan token..."
                                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono text-xl tracking-widest text-center"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isScanning || !tokenInput.trim()}
                                        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                                    >
                                        <Send size={20} />
                                        {isScanning ? 'Memproses...' : 'Absen Sekarang'}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Admin Filter */}
                    {canManage && (
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex flex-wrap items-center gap-4">
                                <Filter size={18} className="text-gray-400" />
                                <select
                                    value={kegiatanFilter}
                                    onChange={(e) => {
                                        setKegiatanFilter(e.target.value);
                                        setPertemuanFilter('');
                                        setPage(1);
                                    }}
                                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Pilih Kegiatan untuk melihat absensi</option>
                                    {kegiatan.map((k) => (
                                        <option key={k.id} value={k.id}>{k.name}</option>
                                    ))}
                                </select>
                                {kegiatanFilter && pertemuanOptions.length > 0 && (
                                    <select
                                        value={pertemuanFilter}
                                        onChange={(e) => { setPertemuanFilter(e.target.value); setPage(1); }}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Semua Pertemuan</option>
                                        {pertemuanOptions.map((label) => (
                                            <option key={label} value={label}>{label}</option>
                                        ))}
                                    </select>
                                )}
                                {kegiatanFilter && (
                                    <>
                                        <button
                                            onClick={openCreateModal}
                                            className="btn btn-primary flex items-center gap-2"
                                        >
                                            <Plus size={18} />
                                            Manual Entry
                                        </button>
                                        <button
                                            onClick={handleExportAbsensi}
                                            className="btn btn-secondary flex items-center gap-2"
                                        >
                                            <Download size={18} />
                                            Export
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900">
                                {canManage && kegiatanFilter ? 'Daftar Absensi Kegiatan' : 'Riwayat Absensi Anda'}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        {canManage && kegiatanFilter && (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIM</th>
                                            </>
                                        )}
                                        {!kegiatanFilter && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kegiatan</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pertemuan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                                        {canManage && kegiatanFilter && (
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        )}
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
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                {canManage && !kegiatanFilter
                                                    ? 'Pilih kegiatan untuk melihat data absensi'
                                                    : 'Belum ada riwayat absensi'}
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                {canManage && kegiatanFilter && (
                                                    <>
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.userName || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{item.userNim || '-'}</td>
                                                    </>
                                                )}
                                                {!kegiatanFilter && (
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item.kegiatanName || '-'}</td>
                                                )}
                                                <td className="px-6 py-4">
                                                    {item.tokenLabel ? (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                            {item.tokenLabel}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[item.status]}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{formatTime(item.checkInTime)}</td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{item.note || '-'}</td>
                                                {canManage && kegiatanFilter && (
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
                                                )}
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
                </div>
            )}

            {/* Admin Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Absensi' : 'Manual Entry'} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anggota *</label>
                        {editingItem ? (
                            <input
                                type="text"
                                value={users.find(u => u.id === form.userId)?.name || '-'}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            />
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={userSearchInput}
                                    onChange={(e) => {
                                        setUserSearchInput(e.target.value);
                                        setShowUserDropdown(true);
                                        setForm({ ...form, userId: '' });
                                    }}
                                    onFocus={() => setShowUserDropdown(true)}
                                    placeholder="Ketik nama atau NIM untuk mencari..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required={!form.userId}
                                />
                                {showUserDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {users.length === 0 ? (
                                            <div className="px-3 py-2 text-gray-500 text-sm">
                                                Memuat data user...
                                            </div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div className="px-3 py-2 text-gray-500 text-sm">
                                                Tidak ditemukan "{userSearchInput}"
                                            </div>
                                        ) : (
                                            filteredUsers.slice(0, 20).map((u) => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setForm({ ...form, userId: u.id });
                                                        setUserSearchInput(`${u.name} (${u.nim || u.email})`);
                                                        setShowUserDropdown(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.nim || u.email}</p>
                                                    </div>
                                                    {u.departemenName && (
                                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                            {u.departemenName}
                                                        </span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                                {form.userId && (
                                    <p className="mt-1 text-xs text-green-600">✓ Anggota terpilih</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pertemuan</label>
                        <input
                            type="text"
                            value={form.tokenLabel}
                            onChange={(e) => setForm({ ...form, tokenLabel: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="cth: Rapat 1, Day 1, Pertemuan 3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional - label untuk identifikasi pertemuan</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                        <textarea
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={isSaving || (!editingItem && !form.userId)} className="btn btn-primary">
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
