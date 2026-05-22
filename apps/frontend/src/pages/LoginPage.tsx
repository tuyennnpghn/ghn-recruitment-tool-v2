import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/requests', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — GHN Branding ── */}
      <div
        className="hidden md:flex w-2/5 flex-col items-center justify-center px-10 py-16 relative overflow-hidden bg-gradient-to-br from-[#FF5200] via-orange-600 to-orange-800"
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-10 bg-white" />

        <div className="relative z-10 text-center">
          <img
            src="/images/ghn-logo-icon.png"
            alt="GHN"
            className="mx-auto h-20 w-20 object-contain mb-6 drop-shadow-lg"
          />
          <h1 className="text-white text-3xl font-extrabold mb-2 tracking-tight">
            GHN Recruitment
          </h1>
          <p className="text-white/70 text-sm mb-10 leading-relaxed">
            Hệ thống quản lý tuyển dụng nội bộ<br />dành riêng cho team HRBP
          </p>

          <div className="space-y-3 text-left">
            {[
              { icon: '📋', text: 'Quản lý Request tuyển dụng tập trung' },
              { icon: '👥', text: 'Candidate Pool — tìm kiếm, match nhanh' },
              { icon: '📊', text: 'Dashboard & báo cáo lead-time tự động' },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-white text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-white/40 text-xs">
          GiaoHangNhanh · HRBP Internal Tool · v1.0
        </p>
      </div>

      {/* ── Right panel — Login form ── */}
      <div className="flex flex-1 items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <img src="/images/ghn-logo-icon.png" alt="GHN" className="h-8 w-8 object-contain" />
            <span className="font-bold text-base">GHN Recruitment</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Đăng nhập</h2>
          <p className="text-sm text-muted-foreground mb-8">Nhập thông tin tài khoản để tiếp tục</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@ghn.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                ⚠️ {error}
              </div>
            )}

            <Button
              id="btn-login"
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Tài khoản được cấp bởi Admin hệ thống
          </p>
        </div>
      </div>
    </div>
  );
}
