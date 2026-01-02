import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import type { ApiResponse, Role } from '../types';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirm } from '../components/ui/DeleteConfirm';
import toast from 'react-hot-toast';

const AVAILABLE_PERMISSIONS = [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'roles:read', 'roles:create', 'roles:update', 'roles:delete',
    'departemen:read', 'departemen:create', 'departemen:update', 'departemen:delete',
    'kepengurusan:read', 'kepengurusan:create', 'kepengurusan:update', 'kepengurusan:delete',
    'kegiatan:read', 'kegiatan:create', 'kegiatan:update', 'kegiatan:delete',
    'absensi:read', 'absensi:create', 'absensi:update', 'absensi:delete',
    'kas:read', 'kas:create', 'kas:update', 'kas:delete',
    'arsip:read', 'arsip:create', 'arsip:update', 'arsip:delete',
];

export function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<ApiResponse<Role[]>>('/roles');
            setRoles(res.data.data);
        } catch {
            toast.error('Gagal memuat data roles');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setForm({ name: '', description: '', permissions: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || [],
        });
        setIsModalOpen(true);
    };

    const togglePermission = (perm: string) => {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter((p) => p !== perm)
                : [...prev.permissions, perm],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, form);
                toast.success('Role berhasil diperbarui');
            } else {
                await api.post('/roles', form);
                toast.success('Role berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchRoles();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal menyimpan role');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingRole) return;
        setIsSaving(true);

        try {
            await api.delete(`/roles/${deletingRole.id}`);
            toast.success('Role berhasil dihapus');
            setIsDeleteOpen(false);
            fetchRoles();
        } catch {
            toast.error('Gagal menghapus role');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                    <p className="text-gray-600">Kelola role dan permissions</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Tambah Role
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Tidak ada data role
                    </div>
                ) : (
                    roles.map((role) => (
                        <div key={role.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 capitalize">{role.name}</h3>
                                    <p className="text-sm text-gray-500">{role.description || 'Tidak ada deskripsi'}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(role)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDeletingRole(role);
                                            setIsDeleteOpen(true);
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {(role.permissions || []).slice(0, 5).map((perm) => (
                                    <span key={perm} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                        {perm}
                                    </span>
                                ))}
                                {(role.permissions || []).length > 5 && (
                                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                        +{role.permissions.length - 5} lainnya
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRole ? 'Edit Role' : 'Tambah Role'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role *</label>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.permissions.includes(perm)}
                                        onChange={() => togglePermission(perm)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{perm}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                            Batal
                        </button>
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
                message={`Apakah Anda yakin ingin menghapus role "${deletingRole?.name}"?`}
            />
        </div>
    );
}
