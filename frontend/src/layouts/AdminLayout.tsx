import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    UserCog,
    Calendar,
    QrCode,
    ClipboardCheck,
    Wallet,
    Receipt,
    FileText,
    FolderArchive,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Key,
} from 'lucide-react';

interface MenuItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles?: string[];
}

const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'pengurus', 'bendahara'] },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} />, roles: ['admin'] },
    { name: 'Departemen', path: '/admin/departemen', icon: <Building2 size={20} />, roles: ['admin', 'pengurus', 'bendahara'] },
    { name: 'Kepengurusan', path: '/admin/kepengurusan', icon: <UserCog size={20} />, roles: ['admin', 'pengurus'] },
    { name: 'Kegiatan', path: '/admin/kegiatan', icon: <Calendar size={20} />, roles: ['admin', 'pengurus', 'bendahara'] },
    { name: 'Absensi Token', path: '/admin/absensi-token', icon: <QrCode size={20} />, roles: ['admin', 'pengurus'] },
    { name: 'Absensi', path: '/admin/absensi', icon: <ClipboardCheck size={20} /> },
    { name: 'Kas', path: '/admin/kas', icon: <Wallet size={20} />, roles: ['admin', 'bendahara'] },
    { name: 'Transaksi', path: '/admin/kas-detail', icon: <Receipt size={20} />, roles: ['admin', 'bendahara'] },
    { name: 'Laporan Kas', path: '/admin/laporan-kas', icon: <FileText size={20} />, roles: ['admin', 'bendahara'] },
    { name: 'Arsip', path: '/admin/arsip', icon: <FolderArchive size={20} /> },
];

export function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, logout, hasRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredMenu = menuItems.filter((item) => {
        if (!item.roles) return true;
        return hasRole(...item.roles);
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                    <Link to="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src="/logo-fkmb.png" alt="FKMB UNESA" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-gray-900">FKMB</span>
                            <p className="text-xs text-gray-500">UNESA</p>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-5rem)]">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
                    {filteredMenu.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className={`transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content */}
            <div className="lg:ml-72 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1" />

                    {/* User menu */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {userMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => { setUserMenuOpen(false); navigate('/admin/change-password'); }}
                                        >
                                            <Key size={18} className="text-gray-400" />
                                            <span>Ubah Password</span>
                                        </button>
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
