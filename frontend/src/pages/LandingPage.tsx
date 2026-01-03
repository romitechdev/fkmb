import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    GraduationCap,
    Heart,
    Handshake,
    School,
    PartyPopper,
    BookOpen,
    Target,
    ChevronDown,
    ChevronUp,
    Instagram,
    Mail,
    Phone,
    Menu,
    X,
    ArrowRight,
    Sparkles,
    Globe,
    Award,
    Calendar
} from 'lucide-react';

const NAV_LINKS = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Tentang Kami', href: '#tentang' },
    { name: 'Program Kerja', href: '#program' },
    { name: 'Beasiswa', href: '#beasiswa' },
];

const BENEFITS = [
    {
        icon: Globe,
        title: 'Networking Lintas Fakultas',
        description: 'Perluas relasi dengan kakak tingkat dan teman dari berbagai jurusan di Unesa.',
    },
    {
        icon: GraduationCap,
        title: 'Info Beasiswa Pemkab',
        description: 'Update tercepat mengenai Beasiswa Scientist, Beasiswa Akhir Perkuliahan, dan bantuan biaya pendidikan dari Pemkab Bojonegoro.',
    },
    {
        icon: Award,
        title: 'Pengembangan Skill',
        description: 'Asah jiwa kepemimpinan, manajemen organisasi, hingga public speaking melalui program kerja nyata.',
    },
    {
        icon: Heart,
        title: 'Support System',
        description: 'Temukan teman se-daerah untuk berbagi info kos, akademik, hingga bantuan saat keadaan darurat di perantauan.',
    },
];

const PROGRAMS = [
    {
        icon: School,
        title: 'FGTS (FKMB Goes To School)',
        description: 'Sosialisasi kampus ke SMA/SMK sederajat di Bojonegoro untuk membantu adik-adik kelas menentukan masa depan.',
        color: 'bg-blue-500',
    },
    {
        icon: PartyPopper,
        title: 'MAKRAB (Malam Keakraban)',
        description: 'Momen penyambutan mahasiswa baru untuk mempererat tali persaudaraan agar lebih akrab dan "guyub".',
        color: 'bg-purple-500',
    },
    {
        icon: Handshake,
        title: 'FKMB Mengabdi',
        description: 'Aksi nyata terjun ke masyarakat Bojonegoro melalui kegiatan sosial, pendidikan, dan lingkungan.',
        color: 'bg-green-500',
    },
    {
        icon: BookOpen,
        title: 'Try Out & Edu-Event',
        description: 'Membantu persiapan calon mahasiswa baru asal Bojonegoro untuk menembus seleksi masuk PTN.',
        color: 'bg-orange-500',
    },
];

const FAQS = [
    {
        question: 'Apakah semua mahasiswa Bojonegoro di Unesa otomatis jadi anggota?',
        answer: 'Secara domisili iya, namun sangat disarankan mengikuti kegiatan kaderisasi agar terdata secara resmi di database anggota.',
    },
    {
        question: 'Dimana lokasi kumpul FKMB Unesa?',
        answer: 'Kami sering berkumpul di sekitar Kampus Lidah Wetan maupun Ketintang, menyesuaikan agenda kegiatan.',
    },
    {
        question: 'Bagaimana cara bergabung?',
        answer: 'Silakan klik tombol "Gabung Sekarang" untuk masuk ke grup koordinasi mahasiswa baru.',
    },
];

export function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/favicon.png"
                                alt="FKMB UNESA"
                                className="h-10 w-10"
                            />
                            <span className="font-bold text-xl text-gray-900">FKMB UNESA</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Link
                                to="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
                            >
                                Gabung
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-4 py-4 space-y-3">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block text-gray-600 hover:text-blue-600 font-medium py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Link
                                to="/login"
                                className="block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium text-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Gabung
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section id="beranda" className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles size={16} />
                            Organisasi Daerah Bojonegoro di UNESA
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Keluarga Bojonegoro di Perantauan,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                Bersama Mengukir Prestasi
                            </span>{' '}
                            di Unesa
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            Wadah kolaborasi, pengabdian, dan persaudaraan bagi seluruh mahasiswa asal Bojonegoro yang menempuh studi di Universitas Negeri Surabaya.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://wa.me/6282244623402"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
                            >
                                Gabung Sekarang
                                <ArrowRight size={20} />
                            </a>
                            <a
                                href="#tentang"
                                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                            >
                                Kenali Kami Lebih Jauh
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { value: '500+', label: 'Anggota Aktif' },
                                { value: '7+', label: 'Tahun Berdiri' },
                                { value: '20+', label: 'Program Kerja' },
                                { value: '100%', label: 'Guyub Rukun' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</div>
                                    <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="tentang" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Mengenal <span className="text-blue-600">FKMB Unesa</span>
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                FKMB Unesa (Forum Komunikasi Mahasiswa Bojonegoro Universitas Negeri Surabaya) adalah Organisasi Daerah (ORDA) yang menjadi rumah bagi putra-putri daerah Bojonegoro.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Kami hadir untuk memastikan <strong>tidak ada mahasiswa Bojonegoro yang merasa sendirian di Surabaya</strong>.
                            </p>

                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <Target size={24} />
                                    <h3 className="font-semibold text-lg">Visi Kami</h3>
                                </div>
                                <p className="text-blue-100">
                                    Menjadi organisasi daerah yang solid, adaptif, dan kontributif dalam membentuk mahasiswa Bojonegoro yang unggul serta bermanfaat bagi daerah asal.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50">
                                <Users className="text-blue-600 mb-4" size={32} />
                                <h4 className="font-semibold text-gray-900 mb-2">Kebersamaan</h4>
                                <p className="text-gray-500 text-sm">Membangun ikatan kekeluargaan yang kuat</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 mt-8">
                                <GraduationCap className="text-purple-600 mb-4" size={32} />
                                <h4 className="font-semibold text-gray-900 mb-2">Pendidikan</h4>
                                <p className="text-gray-500 text-sm">Mendukung prestasi akademik anggota</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50">
                                <Heart className="text-red-500 mb-4" size={32} />
                                <h4 className="font-semibold text-gray-900 mb-2">Kepedulian</h4>
                                <p className="text-gray-500 text-sm">Saling membantu dalam suka dan duka</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 mt-8">
                                <Handshake className="text-green-600 mb-4" size={32} />
                                <h4 className="font-semibold text-gray-900 mb-2">Pengabdian</h4>
                                <p className="text-gray-500 text-sm">Berkontribusi untuk Bojonegoro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Mengapa Harus <span className="text-blue-600">Bergabung?</span>
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Bergabung dengan FKMB Unesa membuka banyak peluang untuk pengembangan diri dan networking.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {BENEFITS.map((benefit, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-5 transition-colors">
                                    <benefit.icon className="text-blue-600 group-hover:text-white transition-colors" size={28} />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-3">{benefit.title}</h3>
                                <p className="text-gray-500">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section id="program" className="py-20 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Apa Saja <span className="text-blue-400">Kegiatan Kami?</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Program kerja yang dirancang untuk pengembangan anggota dan pengabdian masyarakat.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {PROGRAMS.map((program, index) => (
                            <div
                                key={index}
                                className="group bg-gray-800 hover:bg-gray-750 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div className={`${program.color} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <program.icon className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-xl mb-3">{program.title}</h3>
                                        <p className="text-gray-400">{program.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Beasiswa Section */}
            <section id="beasiswa" className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Kawal Beasiswa Bojonegoro
                            </h2>
                            <p className="text-blue-100 text-lg mb-8">
                                Kami berkomitmen membantu anggota dalam mendapatkan hak pendidikan melalui pendampingan informasi:
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Beasiswa Pendidikan Tinggi (Scientist/Dua Sarjana Per Desa)',
                                    'Beasiswa Bantuan Tugas Akhir',
                                    'Update Syarat & Alur Pengajuan berkas ke Dinas Pendidikan Bojonegoro',
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                        <p className="text-blue-50">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                            <Calendar className="text-white mb-6" size={48} />
                            <h3 className="text-2xl font-bold text-white mb-4">Update Info Beasiswa</h3>
                            <p className="text-blue-100 mb-6">
                                Dapatkan notifikasi terbaru mengenai pembukaan beasiswa dari Pemkab Bojonegoro.
                            </p>
                            <a
                                href="https://wa.me/6282244623402"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Hubungi Kami
                                <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Sering Ditanyakan
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                            >
                                <button
                                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                                    ) : (
                                        <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-5">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Siap Bergabung dengan Keluarga Besar FKMB?
                    </h2>
                    <p className="text-gray-600 text-lg mb-10">
                        Mari bersama-sama mengukir prestasi dan membangun Bojonegoro dari perantauan.
                    </p>
                    <a
                        href="https://wa.me/6282244623402"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
                    >
                        Gabung Sekarang
                        <ArrowRight size={20} />
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/favicon.png"
                                    alt="FKMB UNESA"
                                    className="h-10 w-10"
                                />
                                <span className="font-bold text-xl">FKMB UNESA</span>
                            </div>
                            <p className="text-gray-400 text-lg italic mb-4">
                                "Guyub Rukun Sak Lawase"
                            </p>
                            <p className="text-gray-500 text-sm">
                                Forum Komunikasi Mahasiswa Bojonegoro<br />
                                Universitas Negeri Surabaya
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Navigasi</h4>
                            <ul className="space-y-2">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.name}>
                                        <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="https://instagram.com/fkmb_unesa"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Instagram size={20} />
                                        @fkmb_unesa
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="mailto:fkmbunesa@gmail.com"
                                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Mail size={20} />
                                        fkmbunesa@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://wa.me/6282244623402"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Phone size={20} />
                                        +62 822-4462-3402
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                        © 2025 FKMB Unesa. Developed for Romi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
