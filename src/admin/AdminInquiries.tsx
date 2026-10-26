import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Inbox, Loader2, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { isSupabaseConfigured, supabase } from '../academy/supabase';

type InquiryStatus = 'new' | 'contacted' | 'enrolled' | 'closed';
type AdmissionInquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
};

const STATUS_OPTIONS: InquiryStatus[] = ['new', 'contacted', 'enrolled', 'closed'];

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadInquiries = useCallback(async (quiet = false) => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Set the project URL and publishable key in the environment.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('admission_inquiries')
        .select('id,name,phone,email,course,message,status,created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (queryError) throw queryError;
      setInquiries((data || []) as AdmissionInquiry[]);
    } catch (err: any) {
      setError(err?.message || 'Could not load admission inquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInquiries();
  }, [loadInquiries]);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    setUpdatingId(id);
    setNotice(null);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('admission_inquiries')
        .update({ status })
        .eq('id', id);
      if (updateError) throw updateError;
      setInquiries(current => current.map(item => item.id === id ? { ...item, status } : item));
      setNotice('Inquiry status updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not update inquiry status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const newCount = inquiries.filter(item => item.status === 'new').length;

  return (
    <ScreenWrapper className="bg-slate-50 p-4 lg:p-8 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">Admissions CRM</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">Admission inquiries</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Review website leads, follow up on WhatsApp, and keep each inquiry’s status up to date.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadInquiries(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total inquiries</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{inquiries.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">New leads</p>
          <p className="mt-2 text-3xl font-black text-amber-950">{newCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Followed up</p>
          <p className="mt-2 text-3xl font-black text-emerald-950">{inquiries.filter(item => item.status !== 'new').length}</p>
        </div>
      </div>

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</div>}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Inbox size={18} className="text-blue-700" />
            <h2 className="font-extrabold text-slate-900">Recent leads</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">Newest first · up to 200</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm font-semibold text-slate-500">
            <Loader2 size={20} className="animate-spin text-blue-700" /> Loading inquiries…
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Inbox size={25} /></div>
            <h3 className="mt-4 font-extrabold text-slate-900">No inquiries yet</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">Website admission forms will appear here after the database environment variables are configured and the form is submitted.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {inquiries.map(item => (
              <article key={item.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-900">{item.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                      item.status === 'new' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'enrolled' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'
                    }`}>{item.status.replace('_', ' ')}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-800">{item.course}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{item.phone}</span>
                    {item.email && <span>{item.email}</span>}
                  </div>
                  {item.message && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{item.message}</p>}
                </div>
                <div className="flex flex-col gap-2 lg:items-stretch">
                  <a
                    href={whatsappUrl(item.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700"
                  >
                    <MessageCircle size={15} /> Follow up on WhatsApp <ExternalLink size={12} />
                  </a>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor={`status-${item.id}`}>Lead status</label>
                  <select
                    id={`status-${item.id}`}
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={event => void updateStatus(item.id, event.target.value as InquiryStatus)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </ScreenWrapper>
  );
}
