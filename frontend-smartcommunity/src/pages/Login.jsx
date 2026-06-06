import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // State bantuan internal untuk animasi fokus input
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Jalur Cek Akun Admin Kelurahan Seeder Bawaan
            if (email === 'admin@smartcommunity.com') {
                const adminData = {
                    id: 2,
                    name: "Admin Smart Community",
                    email: "admin@smartcommunity.com",
                    phone: "12345678",
                    roles: [{ id: 1, name: "ROLE_ADMIN" }]
                };
                localStorage.setItem('user', JSON.stringify(adminData));
                window.location.href = '/admin/dashboard';
                return;
            }

            // 2. Cek Akun Warga dari Database Asli MySQL
            const response = await fetch('http://localhost:8080/api/users');
            if (response.ok) {
                const users = await response.json();
                const matchedUser = users.find(u => u.email === email);

                if (matchedUser) {
                    // Berhasil login dengan data MySQL murni!
                    localStorage.setItem('user', JSON.stringify(matchedUser));
                    window.location.href = '/user/dashboard';
                    return;
                }
            }

            setError('Email tidak terdaftar di sistem!');

        } catch (err) {
            console.error("Gagal terhubung ke MySQL:", err);
            setError('Gagal login: Tidak dapat menghubungi server Database.');
        }
    };

    const theme = {
        bg: '#f4f6fa',
        cardBg: '#ffffff',
        textMain: '#111827',
        textSub: '#6b7280',
        accent: '#10b981',
        border: 'rgba(0, 0, 0, 0.08)',
        inputBg: '#ffffff',
        errorBg: '#fef2f2',
        errorText: '#ef4444',
        infoBg: '#f0fdf4',
        infoBorder: '#bbf7d0',
        linkText: '#10b981'
    };

    return (
        <div style={{ margin: 0, padding: '20px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '440px', backgroundColor: theme.cardBg, padding: '45px 40px', borderRadius: '28px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.02), 0 10px 10px -5px rgba(0, 0, 0, 0.01)', boxSizing: 'border-box' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16,185,129,0.25)', color: '#fff', fontSize: '22px', margin: '0 auto 16px auto' }}>🌱</div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textMain, letterSpacing: '-0.5px' }}>SmartCommunity</h2>
                    <p style={{ margin: '6px 0 0 0', color: theme.textSub, fontSize: '13px', fontWeight: '500' }}>Silakan masuk untuk mengelola ekosistem lingkungan</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: theme.errorBg, color: theme.errorText, padding: '14px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginBottom: '24px', border: `1px solid rgba(239, 68, 68, 0.15)` }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: theme.textMain, letterSpacing: '0.2px' }}>Email Proyek:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            onFocus={() => setIsEmailFocused(true)}
                            onBlur={() => setIsEmailFocused(false)}
                            placeholder="Masukkan email warga / admin"
                            required 
                            style={{ width: '100%', padding: '14px', border: `1px solid ${isEmailFocused ? theme.accent : theme.border}`, backgroundColor: theme.inputBg, color: theme.textMain, borderRadius: '12px', outline: 'none', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', transition: 'all 0.2s', boxShadow: isEmailFocused ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: theme.textMain, letterSpacing: '0.2px' }}>Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            placeholder="Bebaskan saja untuk uji coba"
                            style={{ width: '100%', padding: '14px', border: `1px solid ${isPasswordFocused ? theme.accent : theme.border}`, backgroundColor: theme.inputBg, color: theme.textMain, borderRadius: '12px', outline: 'none', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', transition: 'all 0.2s', boxShadow: isPasswordFocused ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : 'none' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.25)', transition: '0.2s', marginTop: '8px' }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        Masuk Aplikasi
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', fontWeight: '600', color: theme.textSub }}>
                    Belum memiliki akun warga?{' '}
                    <a href="/register" style={{ color: theme.linkText, textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
                        Daftar disini
                    </a>
                </div>

                <div style={{ marginTop: '35px', padding: '20px', backgroundColor: theme.infoBg, border: `1px solid ${theme.infoBorder}`, borderRadius: '16px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: '#047857' }}>💡 Petunjuk Demo Akses UTS:</p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#065f46', fontWeight: '600', lineHeight: '1.7' }}>
                        <li style={{ marginBottom: '6px' }}>Admin Kelurahan:<br/><code style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px', color: theme.textMain }}>admin@smartcommunity.com</code></li>
                        <li>Warga / User Biasa:<br/><code style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px', color: theme.textMain }}>raflyalfazari62@gmail.com</code></li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default Login;