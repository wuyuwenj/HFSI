'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-slate-200 antialiased selection:bg-blue-600/20 selection:text-white">
      {/* Background Grid Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
        }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-md bg-blue-600 ring-1 ring-blue-500/30 grid place-items-center text-white font-semibold tracking-tight group-hover:ring-blue-500/50 transition-all duration-200">
              E
            </div>
            <span className="text-white font-semibold tracking-tight">Evidex</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how" className="text-slate-400 hover:text-white transition-colors">How it works</a>
            <a href="#use-cases" className="text-slate-400 hover:text-white transition-colors">Use cases</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/analyze')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              <span>Start Analyzing</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.15), transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-6">
              <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight text-white">
                Uncover Truth in Legal Cases with AI‑Powered Analysis
              </h1>
              <p className="mt-6 text-lg text-slate-300">
                Evidex analyzes case documents, transcripts, and evidence to identify potential wrongful convictions and inconsistencies—upholding the presumption of innocence.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/analyze')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385V4.804z" />
                  </svg>
                  <span>Start Analyzing Cases</span>
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 border border-slate-600 text-white rounded-md hover:bg-slate-800 transition-all inline-flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Learn More</span>
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Built on strict legal standards
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Insights in minutes
                </div>
              </div>
            </div>

            {/* Visuals */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-xl">
                {/* Innocence Score Gauge */}
                <div className="relative bg-slate-800/60 backdrop-blur rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Innocence Score</p>
                      <p className="text-2xl font-semibold tracking-tight text-white">86</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-green-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      High confidence
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-6">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 rounded-full p-1 bg-slate-900/60 border border-slate-600">
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            background: 'conic-gradient(rgb(34,197,94) 0deg, rgb(34,197,94) 309.6deg, rgba(45,212,191,0.35) 309.6deg, rgba(45,212,191,0.35) 345.6deg, rgba(100,116,139,0.2) 345.6deg 360deg)'
                          }}
                        />
                      </div>
                      <div className="absolute inset-2 rounded-full bg-slate-900/90 border border-slate-600 grid place-items-center">
                        <div className="text-center">
                          <div className="text-4xl font-semibold tracking-tight text-white animate-pulse">86</div>
                          <div className="text-xs text-slate-400">of 100</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span className="text-sm text-slate-300">Reliable evidence</span>
                        </div>
                        <span className="text-sm text-slate-400">72%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                          <span className="text-sm text-slate-300">Neutral</span>
                        </div>
                        <span className="text-sm text-slate-400">10%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          <span className="text-sm text-slate-300">Contradictions</span>
                        </div>
                        <span className="text-sm text-slate-400">18%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating: Critical Alerts */}
                <div className="absolute -right-6 -bottom-10 w-72 bg-slate-800/70 backdrop-blur rounded-xl p-4 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Critical Alerts</p>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2 rounded-md border border-slate-600 bg-slate-900/30 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm text-white">Witness statement conflicts</p>
                        <p className="text-xs text-slate-400">Two transcripts report differing timelines.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-md border border-slate-600 bg-slate-900/30 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm text-white">Missing chain-of-custody</p>
                        <p className="text-xs text-slate-400">Evidence log incomplete for 6 hours.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-white">Key Features</h2>
            <div className="hidden md:block text-sm text-slate-400">Precision tools built for legal rigor</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>}
              title="Multi-Format Document Analysis"
              items={[
                { text: "PDFs, DOCX, TXT files" },
                { text: "Audio transcription (MP3, WAV, M4A)" },
                { text: "Automatic multi-case detection" },
              ]}
            />

            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
              title="AI-Powered Legal Intelligence"
              items={[
                { text: "Advanced AI for deep analysis" },
                { text: "Evidence reliability scoring" },
                { text: "Timeline reconstruction" },
              ]}
            />

            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01-.553-.894V3a1 1 0 011-1zM5 5a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" clipRule="evenodd" /></svg>}
              title="Presumption of Innocence Focus"
              items={[
                { text: "Innocence scoring (0–100)" },
                { text: "Critical alert detection" },
                { text: "Precedent case matching" },
                { text: "Priority case management" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 py-16 lg:py-24 border-t border-slate-700 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-10">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Upload Files", desc: "Upload documents (PDF, DOCX, TXT), audio (MP3, WAV, M4A), or paste text." },
              { step: 2, title: "AI Analysis", desc: "Advanced AI examines all evidence, statements, audio transcripts, and timelines in detail." },
              { step: 3, title: "Get Insights", desc: "Review comprehensive inconsistencies, reliability scores, and critical alerts." },
              { step: 4, title: "Complete Report", desc: "Access in-depth analysis report with innocence scoring and recommendations." },
            ].map((item) => (
              <div key={item.step} className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-md bg-blue-600/20 text-blue-400 grid place-items-center border border-blue-600/20 font-semibold">
                    {item.step}
                  </span>
                  <h3 className="font-medium text-white">{item.title}</h3>
                </div>
                <p className="mt-3 text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="relative z-10 py-16 lg:py-24 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-10">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UseCaseCard
              title="For Legal Professionals"
              items={[
                { text: "Identify overlooked evidence" },
                { text: "Spot witness inconsistencies" },
                { text: "Prepare stronger appeals" },
              ]}
            />

            <UseCaseCard
              title="Innocence Projects"
              items={[
                { text: "Review conviction integrity" },
                { text: "Prioritize high-merit cases" },
                { text: "Support exoneration efforts" },
              ]}
            />

            <UseCaseCard
              title="Advocacy Groups"
              items={[
                { text: "Research systemic issues" },
                { text: "Highlight miscarriages of justice" },
                { text: "Educate the public" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-700 py-12 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-blue-600 ring-1 ring-blue-500/30 grid place-items-center text-white font-semibold tracking-tight">
                E
              </div>
              <span className="text-white font-semibold">Evidex</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2025 Evidex. Upholding the presumption of innocence through AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, items }: { icon: React.ReactNode; title: string; items: Array<{ text: string }> }) => (
  <div className="group bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="text-lg font-medium text-white">{title}</h3>
    </div>
    <ul className="mt-4 space-y-2 text-slate-400">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

const UseCaseCard = ({ title, items }: { title: string; items: Array<{ text: string }> }) => (
  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
    <h3 className="font-medium text-white mb-4">{title}</h3>
    <ul className="space-y-2 text-slate-400">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

export default HomePage;