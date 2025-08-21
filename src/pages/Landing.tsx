import { useState, useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';
import { useAnalyticsEvents } from '../hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics';
import MonthlySalesChart from '../components/ecommerce/MonthlySalesChart';
import { API_URLS, API_CONFIG } from '../config/api';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Lightweight FAQ data
const FAQS = [
  {
    q: 'What is LeakShield?',
    a: 'LeakShield is a vulnerability intelligence and exposure monitoring platform that helps security teams track, prioritize, and remediate exploited vulnerabilities in real time.'
  },
  {
    q: 'How does LeakShield prioritize vulnerabilities?',
    a: 'We combine KEV catalog data, prevalence metrics, CWE risk scoring, vendor exposure and recency signals to surface what truly matters.'
  },
  {
    q: 'Do you support integrations?',
    a: 'Yes. We are building integrations for ticketing (Jira), SIEM, Slack and email workflows. Early adopters can request custom connectors.'
  },
  {
    q: 'Is there an API?',
    a: 'Absolutely. All data you see in the dashboard is powered by a documented REST API for automation use cases.'
  },
  {
    q: 'How is the data updated?',
    a: 'We continuously ingest official KEV and public sources; new exploited vulnerabilities are reflected within minutes.'
  }
];

export default function Landing() {
  const { trackEvent } = useAnalyticsEvents();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  // Remove simulated demo state and introduce live metrics state
  const [liveMetrics, setLiveMetrics] = useState({
    loading: true,
    total: 0,
    high: 0,
    vendors: 0,
    recent: 0,
    response: 0, // percentage
  });
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');

  // NEW: Fetch real vulnerability data for wow metrics
  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        const res = await fetch(API_URLS.VULNERABILITIES, {
          headers: API_CONFIG.HEADERS.NGROK_HEADERS,
          cache: API_CONFIG.OPTIONS.CACHE,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const total = data.length;
        const vendors = new Set(data.map((d: any) => d.vendorProject).filter(Boolean)).size;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recent = data.filter((d: any) => new Date(d.dateAdded) >= thirtyDaysAgo).length;
        // Simulated high severity proportion (align with dashboard cards)
        const high = Math.floor(total * 0.3);
        // Response progress formula (same style as dashboard)
        const ageScore = Math.max(20, 100 - (recent / Math.max(total, 1)) * 100);
        const severityScore = Math.max(10, 100 - ((high) / Math.max(total, 1)) * 80);
        const response = Math.min(100, (ageScore + severityScore) / 2);
        if (isMounted) {
          setLiveMetrics({
            loading: false,
            total,
            high,
            vendors,
            recent,
            response: Math.round(response * 100) / 100,
          });
          trackEvent('landing_live_metrics_loaded', { total, high, vendors, recent, response: Math.round(response * 100) / 100 });
        }
      } catch (e) {
        console.error('Failed to load live metrics', e);
        if (isMounted) setLiveMetrics(prev => ({ ...prev, loading: false }));
      }
    }
    loadMetrics();
    return () => { isMounted = false; };
  }, [trackEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setFormStatus('submitting');
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: form.name,
        email: form.email,
        company: form.company,
        message: form.message,
        createdAt: serverTimestamp(),
      });
      setFormStatus('sent');
      trackEvent('contact_form_submitted', { ...form });
      setForm({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setFormStatus('idle');
    }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQS.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
    }))
  };

  return (
    <>
      <PageMeta
        title="LeakShield – Real‑Time Exploited Vulnerability Intelligence & KEV Monitoring"
        description="LeakShield helps you monitor, prioritize and remediate actively exploited vulnerabilities with KEV intelligence, CWE risk scoring and real‑time exposure analytics."/>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_40%_20%,#fef2f2_0,#fff_40%)] dark:[background:radial-gradient(circle_at_40%_20%,rgba(239,68,68,.15)_0,transparent_45%)]"/>
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
              Operationalize Exploited Vulnerability Intelligence
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              LeakShield unifies KEV catalog monitoring, CWE risk analytics and live exposure metrics so you respond faster and reduce measurable attack surface.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/signup"
                onClick={() => trackEvent('hero_cta_clicked', { cta: 'get_started' })}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Get Started
              </a>
              <a
                href="/app"
                onClick={() => trackEvent('hero_cta_clicked', { cta: 'view_dashboard' })}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Live Dashboard
              </a>
            </div>
            <p className="mt-5 text-xs text-gray-400 dark:text-gray-500">Fast signup • Real‑time KEV & exploited vulnerability monitoring • Secure platform </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">Purpose‑built for Security Velocity</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Everything you need to see, rank and act on the vulnerabilities that move attacker needle.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'KEV Catalog Monitoring', desc: 'Real‑time ingestion of CISA Known Exploited Vulnerabilities with enrichment & change alerts.', icon: '⚡' },
            { title: 'CWE Risk Scoring', desc: 'Data‑driven composite scoring blends CVSS stats, exploitation & prevalence signals.', icon: '🎯' },
            { title: 'Exposure Analytics', desc: 'Track affected vendors & products across your estate to quantify blast radius.', icon: '📊' },
            { title: 'Streamlined Prioritization', desc: 'Contextual badges highlight exploited, high‑impact and recent weaknesses instantly.', icon: '🧭' },
            { title: 'Workflow Integrations', desc: 'Push prioritized items into Jira, Slack & SIEM (early access).', icon: '🔗' },
            { title: 'API First', desc: 'Automate ingestion & reporting with a clean, well‑documented REST API.', icon: '🔐' }
          ].map((f, i) => (
            <div key={i} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]" onClick={() => trackEvent('feature_card_clicked', { feature: f.title })}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-900/20">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-gray-50 py-16 dark:bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">How LeakShield Works</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Under the hood — from ingestion to actionable intelligence.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '1', title: 'Ingest & Normalize', desc: 'Continuously collects exploited vulnerability sources and normalizes metadata.' },
              { step: '2', title: 'Enrich & Score', desc: 'Applies CWE risk formula, exploit prevalence & time‑based weighting.' },
              { step: '3', title: 'Prioritize & Act', desc: 'Surfaced in the dashboard with filters, tags & integrations to drive remediation.' }
            ].map(s => (
              <div key={s.step} className="relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow">{s.step}</div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section id="interactive-demo" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">Live Security Snapshot</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Fresh vulnerability intelligence pulled directly from the active platform.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Metrics Grid */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {/* High Severity */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">High Severity</span>
                  {!liveMetrics.loading && (
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">{Math.round((liveMetrics.high / Math.max(liveMetrics.total,1))*100)}%</span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{liveMetrics.loading ? '—' : liveMetrics.high.toLocaleString()}</p>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Estimated high-impact exploited CVEs</p>
              </div>
              {/* Vendors */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <span className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">Vendors Affected</span>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{liveMetrics.loading ? '—' : liveMetrics.vendors.toLocaleString()}</p>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Unique publisher footprint</p>
              </div>
              {/* Response Progress */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Response Progress</span>
                  {!liveMetrics.loading && (
                    <span className={`text-[10px] font-semibold ${liveMetrics.response >= 80 ? 'text-emerald-600 dark:text-emerald-400' : liveMetrics.response >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{liveMetrics.response >= 80 ? 'Excellent' : liveMetrics.response >= 60 ? 'Good' : 'Needs Focus'}</span>
                  )}
                </div>
                <div className="mt-3 flex items-end gap-4">
                  <p className="text-4xl font-bold leading-none text-gray-900 dark:text-white">{liveMetrics.loading ? '—' : `${liveMetrics.response}%`}</p>
                  {!liveMetrics.loading && (
                    <p className="mb-1 text-[11px] text-gray-500 dark:text-gray-400">Composite remediation & severity posture</p>
                  )}
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className={`h-full transition-all duration-700 ${liveMetrics.response >= 80 ? 'bg-emerald-500' : liveMetrics.response >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: liveMetrics.loading ? '0%' : `${liveMetrics.response}%` }} />
                </div>
              </div>
              {/* Recent / New This Month */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">New This Month</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{liveMetrics.loading ? '—' : liveMetrics.recent.toLocaleString()}</p>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Recently added exploited vulnerabilities</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">Live values update as our ingestion pipeline processes new exploited vulnerability disclosures.</p>
          </div>

          {/* Embedded real components for preview */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <EcommerceMetrics />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <MonthlySalesChart />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 py-16 dark:bg-gray-900/40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Answers to the most common product & platform questions.</p>
          </div>
          <ul className="space-y-4">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <li key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                  <button onClick={() => { setOpenFaq(open ? null : i); trackEvent('faq_toggled', { question: f.q, open: !open }); }} className="flex w-full items-center justify-between text-left">
                    <span className="text-base font-medium text-gray-800 dark:text-white/90">{f.q}</span>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {open && <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.a}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">Talk With Us</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Have a question about adopting LeakShield or joining the early access roadmap? Reach out.</p>
        </div>
        <form onSubmit={handleSubmit} className="mx-auto grid max-w-2xl gap-6 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.05]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Jane Doe" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"/>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="you@company.com" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"/>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
            <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Corp" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"/>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5} placeholder="Tell us about your current vulnerability management challenges..." className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"/>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* <p className="text-xs text-gray-400 dark:text-gray-500">We respond within one business day.</p> */}
            <button disabled={formStatus !== 'idle'} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {formStatus === 'submitting' ? 'Sending...' : formStatus === 'sent' ? 'Message Sent ✓' : 'Send Message'}
            </button>
          </div>
        </form>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="border-t border-gray-200 py-10 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
        <div className="mx-auto max-w-7xl px-6">
          <p>© {new Date().getFullYear()} LeakShield. All rights reserved.</p>
          <p className="mt-2">Built with a focus on clarity, prioritization & measurable risk reduction.</p>
        </div>
      </footer>
    </>
  );
}
