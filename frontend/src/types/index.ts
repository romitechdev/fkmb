// User types
export interface User {
    id: string;
    email: string;
    name: string;
    nim?: string;
    phone?: string;
    fakultas?: string;
    prodi?: string;
    angkatan?: string;
    roleId?: string;
    role?: string;
    roleName?: string;
    departemenId?: string;
    departemenName?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Role types
export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

// Departemen types
export interface Departemen {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    createdAt: string;
    updatedAt: string;
}

// Kepengurusan types
export interface Kepengurusan {
    id: string;
    userId: string;
    departemenId: string;
    jabatan: string;
    periode: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    userName?: string;
    departemenName?: string;
    createdAt: string;
    updatedAt: string;
}

// Kegiatan types
export interface Kegiatan {
    id: string;
    name: string;
    description?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    type: 'rapat' | 'kegiatan' | 'pelatihan' | 'lainnya';
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    departemenId?: string;
    departemenName?: string;
    createdAt: string;
    updatedAt: string;
}

// Absensi Token types
export interface AbsensiToken {
    id: string;
    kegiatanId: string;
    token: string;
    label?: string; // Keterangan pertemuan
    qrCode: string;
    expiresAt: string;
    isActive: boolean;
    kegiatanName?: string;
    createdAt: string;
    updatedAt: string;
}

// Absensi types
export interface Absensi {
    id: string;
    userId: string;
    kegiatanId: string;
    tokenId?: string;
    tokenLabel?: string; // Keterangan pertemuan
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
    checkInTime: string;
    note?: string;
    userName?: string;
    userNim?: string;
    kegiatanName?: string;
    createdAt: string;
    updatedAt: string;
}

// Kas types
export interface Kas {
    id: string;
    periode: string;
    saldoAwal: string;
    saldoAkhir: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Kas Detail types
export interface KasDetail {
    id: string;
    kasId: string;
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran';
    kategori?: string;
    description: string;
    jumlah: string;
    bukti?: string;
    createdBy?: string;
    creatorName?: string;
    kasPeriode?: string;
    createdAt: string;
    updatedAt: string;
}

// Laporan Kas types
export interface LaporanKas {
    id: string;
    kasId: string;
    periode: string;
    totalPemasukan: string;
    totalPengeluaran: string;
    saldoAwal: string;
    saldoAkhir: string;
    fileUrl?: string;
    generatedBy?: string;
    generatorName?: string;
    kasPeriode?: string;
    createdAt: string;
    updatedAt: string;
}

// Arsip types
export interface Arsip {
    id: string;
    title: string;
    description?: string;
    category?: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    departemenId?: string;
    uploadedBy?: string;
    departemenName?: string;
    uploaderName?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}
