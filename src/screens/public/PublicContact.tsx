import React, { useState } from 'react';
import { coursesContent } from '../../data/coursesContent';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const PublicContact: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('Graphic Design (Photoshop)');
  const [city, setCity] = useState('Sadiqabad');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResponseMsg(null);
    setResponseStatus(null);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          course: `${course} (${city})`,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Inquiry could not be submitted.');
      setResponseStatus('success');
      setResponseMsg(data.message || 'Inquiry submitted successfully! Our director will contact you via WhatsApp.');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch {
      setResponseStatus('error');
      setResponseMsg("We couldn't save your inquiry online. Please contact us on WhatsApp at 03093534289.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-bold uppercase tracking-widest border border-white/20">
            Admissions & Campus Visits
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Contact Directorate & Apply for Admission
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Visit our physical campus in Sadiqabad or connect directly with Founder Adeel Bhatti via WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact Information & Physical Campus */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900">Campus Contact Details</h2>

            <div className="space-y-5 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Physical Address</p>
                  <p className="mt-0.5 leading-relaxed text-slate-600">
                    Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Call & WhatsApp Hotline</p>
                  <a
                    href="https://wa.me/923093534289"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block text-emerald-700 font-bold hover:underline"
                  >
                    03093534289 (Adeel Bhatti)
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Available for WhatsApp admission inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Email Address</p>
                  <p className="mt-0.5 text-slate-600">theinspirebusinessacademy@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Campus Hours</p>
                  <p className="mt-0.5 text-slate-600">Monday - Saturday: 9:00 AM - 7:00 PM PKT</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/923093534289?text=Hello%20Adeel%20Bhatti%2C%20I%20want%20to%20visit%20the%20academy%20in%20Sadiqabad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Phone size={16} />
                <span>Chat Instantly on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Admission Form */}
        <div id="apply" className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                Fast-Track Admission Form
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Apply for Admission / Request Course Info
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your details below. Our team reviews submissions daily and responds with batch timetables and fee details.
              </p>
            </div>

            {responseMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${responseStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                {responseStatus === 'error' ? <Phone size={18} className="text-rose-600 shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />}
                <span>{responseMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ali Raza"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sadiqabad, Rahim Yar Khan, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Selected Course Track *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-700"
                >
                  {coursesContent.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Questions or Notes
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about shift timings, class start dates, or fee concessions..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-700 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Online Application</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
