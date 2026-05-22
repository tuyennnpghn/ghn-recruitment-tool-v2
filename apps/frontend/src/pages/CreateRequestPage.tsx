import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface Meta {
  departments: any[];
  levels: any[];
  tracks: any[];
  subTracks: any[];
  users: any[];
}

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meta, setMeta] = useState<Meta>({ departments: [], levels: [], tracks: [], subTracks: [], users: [] });
  const [jobTitles, setJobTitles] = useState<any[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    openDate: new Date().toISOString().split('T')[0],
    departmentId: '',
    section: '',
    team: '',
    jobTitleId: '',
    sGrade: '',
    levelId: '',
    trackId: '',
    subTrackId: '',
    hiringManager: '',
    recruiterId: user?.id ?? '',
    shared1Id: '',
    shared2Id: '',
    shared3Id: '',
    typeOfRecruitment: 'New HC' as 'New HC' | 'Replacement',
    replaceFor: '',
    note: '',
  });

  // Load all master data
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [depts, levels, tracks, subTracks, users] = await Promise.all([
          api.get('/requests/meta/departments'),
          api.get('/requests/meta/levels'),
          api.get('/requests/meta/tracks'),
          api.get('/requests/meta/sub-tracks'),
          api.get('/requests/meta/users'),
        ]);
        setMeta({
          departments: depts.data,
          levels: levels.data,
          tracks: tracks.data,
          subTracks: subTracks.data,
          users: users.data,
        });
      } catch {
        setError('Không thể tải dữ liệu master. Vui lòng tải lại trang.');
      } finally {
        setIsLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  // When dept changes → load job titles & clear dependent fields
  useEffect(() => {
    if (!form.departmentId) { setJobTitles([]); return; }
    api.get(`/requests/meta/departments/${form.departmentId}/job-titles`)
      .then(r => setJobTitles(r.data))
      .catch(() => setJobTitles([]));
    setForm(f => ({ ...f, jobTitleId: '', sGrade: '' }));
  }, [form.departmentId]);

  // When job title changes → auto-fill sGrade
  useEffect(() => {
    const jt = jobTitles.find((j) => j.id === form.jobTitleId);
    setForm(f => ({ ...f, sGrade: jt?.sGrade ?? '' }));
  }, [form.jobTitleId, jobTitles]);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.departmentId) { setError('Vui lòng chọn Phòng ban'); return; }
    if (!form.recruiterId) { setError('Vui lòng chọn Recruiter phụ trách'); return; }

    setIsSubmitting(true);
    try {
      const payload: any = {
        openDate: form.openDate,
        departmentId: form.departmentId,
        typeOfRecruitment: form.typeOfRecruitment,
        recruiterId: form.recruiterId,
      };
      if (form.section) payload.section = form.section;
      if (form.team) payload.team = form.team;
      if (form.jobTitleId) payload.jobTitleId = form.jobTitleId;
      if (form.levelId) payload.levelId = form.levelId;
      if (form.trackId) payload.trackId = form.trackId;
      if (form.subTrackId) payload.subTrackId = form.subTrackId;
      if (form.hiringManager) payload.hiringManager = form.hiringManager;
      if (form.shared1Id) payload.shared1Id = form.shared1Id;
      if (form.shared2Id) payload.shared2Id = form.shared2Id;
      if (form.shared3Id) payload.shared3Id = form.shared3Id;
      if (form.typeOfRecruitment === 'Replacement' && form.replaceFor) payload.replaceFor = form.replaceFor;
      if (form.note) payload.note = form.note;

      const res = await api.post('/requests', payload);
      navigate(`/requests/${res.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Tạo request thất bại. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMeta) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ marginTop: 12, color: 'var(--ghn-silver)' }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const Field = ({ label, required, children }: any) => (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span className="required">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="page-container fade-in" style={{ maxWidth: 860 }}>
      <div className="page-header">
        <div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 8 }}
            onClick={() => navigate('/requests')}
          >← Quay lại</button>
          <h1>Tạo Request Tuyển Dụng Mới</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section: Thông tin cơ bản */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>📋 Thông tin cơ bản</h3>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Field label="Ngày mở Request" required>
              <input
                id="input-openDate"
                type="date"
                className="form-input"
                value={form.openDate}
                onChange={(e) => set('openDate', e.target.value)}
                required
              />
            </Field>

            <Field label="Loại tuyển dụng" required>
              <select
                id="select-typeOfRecruitment"
                className="form-select"
                value={form.typeOfRecruitment}
                onChange={(e) => set('typeOfRecruitment', e.target.value as any)}
                required
              >
                <option value="New HC">New HC</option>
                <option value="Replacement">Replacement</option>
              </select>
            </Field>

            {form.typeOfRecruitment === 'Replacement' && (
              <Field label="Thay thế cho ai">
                <input
                  id="input-replaceFor"
                  type="text"
                  className="form-input"
                  placeholder="Tên người được thay thế"
                  value={form.replaceFor}
                  onChange={(e) => set('replaceFor', e.target.value)}
                />
              </Field>
            )}
          </div>
        </div>

        {/* Section: Vị trí tuyển dụng */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>🏢 Vị trí tuyển dụng</h3>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Field label="Phòng ban" required>
              <select
                id="select-department"
                className="form-select"
                value={form.departmentId}
                onChange={(e) => set('departmentId', e.target.value)}
                required
              >
                <option value="">-- Chọn phòng ban --</option>
                {meta.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Section">
              <input
                id="input-section"
                type="text"
                className="form-input"
                placeholder="VD: Tech, Ops, Sales..."
                value={form.section}
                onChange={(e) => set('section', e.target.value)}
              />
            </Field>

            <Field label="Team">
              <input
                id="input-team"
                type="text"
                className="form-input"
                placeholder="VD: Mobile App, Backend..."
                value={form.team}
                onChange={(e) => set('team', e.target.value)}
              />
            </Field>

            <Field label="Job Title">
              <select
                id="select-jobTitle"
                className="form-select"
                value={form.jobTitleId}
                onChange={(e) => set('jobTitleId', e.target.value)}
                disabled={!form.departmentId}
              >
                <option value="">-- Chọn Job Title --</option>
                {jobTitles.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              {!form.departmentId && (
                <span className="form-error">Chọn phòng ban trước</span>
              )}
            </Field>

            <Field label="S-Grade">
              <input
                type="text"
                className="form-input bg-slate-50"
                value={form.sGrade || 'Tự động điền sau khi chọn Job Title'}
                readOnly
                style={{ color: form.sGrade ? 'var(--ghn-navy)' : 'var(--ghn-silver)' }}
              />
            </Field>

            <Field label="Level">
              <select
                id="select-level"
                className="form-select"
                value={form.levelId}
                onChange={(e) => set('levelId', e.target.value)}
              >
                <option value="">-- Chọn Level --</option>
                {meta.levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}{l.leadTimeDays ? ` (${l.leadTimeDays} ngày)` : ' (N/A)'}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Track">
              <select
                id="select-track"
                className="form-select"
                value={form.trackId}
                onChange={(e) => set('trackId', e.target.value)}
              >
                <option value="">-- Chọn Track --</option>
                {meta.tracks.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Sub-Track">
              <select
                id="select-subTrack"
                className="form-select"
                value={form.subTrackId}
                onChange={(e) => set('subTrackId', e.target.value)}
              >
                <option value="">-- Chọn Sub-Track --</option>
                {meta.subTracks.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Hiring Manager">
              <input
                id="input-hiringManager"
                type="text"
                className="form-input"
                placeholder="Tên Hiring Manager"
                value={form.hiringManager}
                onChange={(e) => set('hiringManager', e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Section: HRBP phụ trách */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>👤 HRBP phụ trách</h3>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Field label="Recruiter phụ trách" required>
              <select
                id="select-recruiter"
                className="form-select"
                value={form.recruiterId}
                onChange={(e) => set('recruiterId', e.target.value)}
                required
              >
                <option value="">-- Chọn HRBP --</option>
                {meta.users.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </Field>

            <Field label="Shared by 1">
              <select
                id="select-shared1"
                className="form-select"
                value={form.shared1Id}
                onChange={(e) => set('shared1Id', e.target.value)}
              >
                <option value="">-- Không có --</option>
                {meta.users.filter(u => u.id !== form.recruiterId).map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </Field>

            <Field label="Shared by 2">
              <select
                id="select-shared2"
                className="form-select"
                value={form.shared2Id}
                onChange={(e) => set('shared2Id', e.target.value)}
              >
                <option value="">-- Không có --</option>
                {meta.users.filter(u => u.id !== form.recruiterId && u.id !== form.shared1Id).map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </Field>

            <Field label="Shared by 3">
              <select
                id="select-shared3"
                className="form-select"
                value={form.shared3Id}
                onChange={(e) => set('shared3Id', e.target.value)}
              >
                <option value="">-- Không có --</option>
                {meta.users.filter(u => u.id !== form.recruiterId && u.id !== form.shared1Id && u.id !== form.shared2Id).map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Note */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>📝 Ghi chú</h3></div>
          <div className="card-body">
            <textarea
              id="input-note"
              className="form-textarea"
              rows={3}
              placeholder="Ghi chú thêm (nếu có)..."
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600"
            style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, fontSize: 14 }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/requests')}
          >
            Huỷ
          </button>
          <button
            id="btn-submit-request"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang lưu...</>
            ) : '✓ Tạo Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
