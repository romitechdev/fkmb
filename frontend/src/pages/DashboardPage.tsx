import { useEffect, useState } from 'react';
import { Users, Calendar, ClipboardCheck, Wallet, Building2, FolderArchive, TrendingUp, Clock, ArrowUpRight, Sparkles, PartyPopper, X } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

interface DashboardData {
    stats: {
        totalUsers: number;
        totalKegiatan: number;
        todayAbsensi: number;
        totalDepartemen: number;
        totalArsip: number;
        saldoKas: string;
        kasPeriode: string | null;
    };
    kegiatanByStatus: {
        upcoming: number;
        ongoing: number;
        completed: number;
        cancelled: number;
    };
    absensiByStatus: {
        hadir: number;
        izin: number;
        sakit: number;
        alpha: number;
    };
    recentKegiatan: Array<{
        id: string;
        name: string;
        startDate: string;
        status: string;
        type: string;
    }>;
    recentAbsensi: Array<{
        id: string;
        userName: string;
        kegiatanName: string;
        status: string;
        checkInTime: string;
    }>;
}

const STATUS_COLORS = ['#3B82F6', '#10B981', '#6B7280', '#EF4444'];

export function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        fetchDashboardData();

        // Show welcome modal for anggota role (first visit)
        if (user?.role === 'anggota') {
            const welcomeKey = `welcome_shown_${user.id}`;
            const alreadyShown = sessionStorage.getItem(welcomeKey);
            if (!alreadyShown) {
                setShowWelcome(true);
                sessionStorage.setItem(welcomeKey, 'true');
            }
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<DashboardData>>('/dashboard/stats');
            setData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(value) || 0);
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center text-gray-500 py-12">
                <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Gagal memuat data dashboard</p>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Anggota',
            value: data.stats.totalUsers,
            icon: <Users size={24} />,
            gradient: 'from-blue-500 to-indigo-600',
            shadowColor: 'shadow-blue-500/25'
        },
        {
            title: 'Total Kegiatan',
            value: data.stats.totalKegiatan,
            icon: <Calendar size={24} />,
            gradient: 'from-emerald-500 to-teal-600',
            shadowColor: 'shadow-emerald-500/25'
        },
        {
            title: 'Absensi Hari Ini',
            value: data.stats.todayAbsensi,
            icon: <ClipboardCheck size={24} />,
            gradient: 'from-amber-500 to-orange-600',
            shadowColor: 'shadow-amber-500/25'
        },
        {
            title: 'Departemen',
            value: data.stats.totalDepartemen,
            icon: <Building2 size={24} />,
            gradient: 'from-purple-500 to-pink-600',
            shadowColor: 'shadow-purple-500/25'
        },
        {
            title: 'Total Arsip',
            value: data.stats.totalArsip,
            icon: <FolderArchive size={24} />,
            gradient: 'from-cyan-500 to-blue-600',
            shadowColor: 'shadow-cyan-500/25'
        },
        {
            title: 'Saldo Kas',
            value: formatCurrency(data.stats.saldoKas),
            subtitle: data.stats.kasPeriode ? `Periode: ${data.stats.kasPeriode}` : null,
            icon: <Wallet size={24} />,
            gradient: 'from-green-500 to-emerald-600',
            shadowColor: 'shadow-green-500/25'
        },
    ];

    const kegiatanPieData = [
        { name: 'Akan Datang', value: data.kegiatanByStatus.upcoming },
        { name: 'Berlangsung', value: data.kegiatanByStatus.ongoing },
        { name: 'Selesai', value: data.kegiatanByStatus.completed },
        { name: 'Dibatalkan', value: data.kegiatanByStatus.cancelled },
    ].filter(item => item.value > 0);

    const absensiBarData = [
        { name: 'Hadir', value: data.absensiByStatus.hadir, fill: '#10B981' },
        { name: 'Izin', value: data.absensiByStatus.izin, fill: '#F59E0B' },
        { name: 'Sakit', value: data.absensiByStatus.sakit, fill: '#3B82F6' },
        { name: 'Alpha', value: data.absensiByStatus.alpha, fill: '#EF4444' },
    ];

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            upcoming: 'bg-blue-100 text-blue-700',
            ongoing: 'bg-green-100 text-green-700',
            completed: 'bg-gray-100 text-gray-700',
            cancelled: 'bg-red-100 text-red-700',
            hadir: 'bg-green-100 text-green-700',
            izin: 'bg-yellow-100 text-yellow-700',
            sakit: 'bg-blue-100 text-blue-700',
            alpha: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const statusLabel: Record<string, string> = {
        upcoming: 'Akan Datang',
        ongoing: 'Berlangsung',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
        hadir: 'Hadir',
        izin: 'Izin',
        sakit: 'Sakit',
        alpha: 'Alpha',
    };

    return (
        <div className="space-y-8">
            {/* Welcome Modal for Anggota */}
            {showWelcome && user?.role === 'anggota' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 animate-bounce-in">
                        {/* Close button */}
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                                <PartyPopper size={40} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Selamat Datang! 🎉
                            </h2>
                            <p className="text-lg text-gray-600 mb-2">
                                Halo, <span className="font-semibold text-blue-600">{user?.name || 'Anggota'}</span>!
                            </p>
                            <p className="text-gray-500 mb-6">
                                Selamat datang di Sistem Informasi FKMB UNESA. Kami senang Anda bergabung bersama kami!
                            </p>
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                Mulai Jelajahi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Selamat datang di Sistem Informasi FKMB UNESA</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Cards - Premium Gradient */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.gradient} text-white shadow-xl ${card.shadowColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">{card.title}</p>
                                <p className="text-3xl font-bold mt-2">{card.value}</p>
                                {card.subtitle && (
                                    <p className="text-sm text-white/70 mt-2">{card.subtitle}</p>
                                )}
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                {card.icon}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-sm text-white/80">
                            <TrendingUp size={14} />
                            <span>Aktif</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kegiatan Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Status Kegiatan</h3>
                            <p className="text-sm text-gray-500">Distribusi berdasarkan status</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Calendar size={20} className="text-blue-600" />
                        </div>
                    </div>
                    {kegiatanPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={kegiatanPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {kegiatanPieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            Tidak ada data kegiatan
                        </div>
                    )}
                </div>

                {/* Absensi Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Statistik Absensi</h3>
                            <p className="text-sm text-gray-500">Bulan ini</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <ClipboardCheck size={20} className="text-green-600" />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={absensiBarData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={60} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Kegiatan */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900">Kegiatan Terbaru</h3>
                            <p className="text-sm text-gray-500">5 kegiatan terakhir</p>
                        </div>
                        <ArrowUpRight size={20} className="text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data.recentKegiatan.length > 0 ? (
                            data.recentKegiatan.map((item) => (
                                <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{formatTime(item.startDate)}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge(item.status)}`}>
                                            {statusLabel[item.status] || item.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-400">
                                Belum ada kegiatan
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Absensi */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900">Absensi Terbaru</h3>
                            <p className="text-sm text-gray-500">5 absensi terakhir</p>
                        </div>
                        <ArrowUpRight size={20} className="text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data.recentAbsensi.length > 0 ? (
                            data.recentAbsensi.map((item) => (
                                <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.userName}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.kegiatanName}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge(item.status)}`}>
                                                {statusLabel[item.status] || item.status}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{formatTime(item.checkInTime)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-400">
                                Belum ada absensi
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
