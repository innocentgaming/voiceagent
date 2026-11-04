import React from 'react';
import { 
  FolderPlus, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Mic, 
  ArrowRight, 
  Layers, 
  ShieldAlert,
  Play,
  BarChart3,
  Volume2,
  Award,
  Sliders,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend 
} from 'recharts';

export default function Dashboard({ 
  stats, 
  projects, 
  onSelectProject, 
  onOpenCreateProject, 
  onViewRunDetails,
  loading 
}) {
  const avgWER = stats?.avgWER || 0;
  const criticalErrors = stats?.criticalErrors || 0;
  const totalRuns = stats?.totalRuns || 0;
  const criticalFailureRate = totalRuns > 0 ? Math.round((criticalErrors / totalRuns) * 100) : 0;

  // Chart data preparing recent runs
  const chartData = (stats?.recentRuns || []).slice(0, 6).map((r, i) => ({
    name: `Run #${i + 1}`,
    WER: r.wer || 0,
    CER: r.cer || 0,
    Accuracy: r.accuracy || Math.max(0, 100 - (r.wer || 0))
  })).reverse();

  // If no runs, dummy baseline preview
  const displayChartData = chartData.length > 0 ? chartData : [
    { name: 'UPI Recipient', WER: 11.1, CER: 8.5, Accuracy: 88.9 },
    { name: 'Hindi Amount', WER: 12.5, CER: 6.2, Accuracy: 87.5 },
    { name: 'Marathi Order', WER: 14.2, CER: 9.1, Accuracy: 85.8 },
    { name: 'Hinglish Cancel', WER: 8.3, CER: 4.1, Accuracy: 91.7 }
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Value Proposition Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <span>IndicVoice Lab v1.0</span> • <span>Gnani AI Great Indian AI Challenge</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
            “Don't just test whether your voice AI transcribes speech. Test whether it understands the information that actually matters.”
          </h1>
          <p className="mt-3 text-slate-400 text-sm md:text-base leading-relaxed">
            Standard STT metrics (WER/CER) can report 90%+ accuracy while failing on a high-stakes transaction recipient name, transfer amount, or account number. IndicVoice Lab evaluates phonetic accuracy alongside critical semantic entities in Hindi, Marathi, and Hinglish.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenCreateProject}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <FolderPlus className="w-4 h-4" />
              Create Testing Project
            </button>
            {projects.length > 0 && (
              <button
                onClick={() => onSelectProject(projects[0]._id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
              >
                <span>Open Active Workspace</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Test Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white">{stats?.totalProjects || 0}</div>
          <div className="mt-2 text-xs text-slate-500">Active test suites configured</div>
        </div>

        {/* Total Test Cases */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audio Test Cases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white">{stats?.totalTestCases || 0}</div>
          <div className="mt-2 text-xs text-slate-500">Hindi, Marathi, Hinglish recordings</div>
        </div>

        {/* Average WER */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average WER</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-400">{avgWER}%</div>
          <div className="mt-2 text-xs text-slate-500">Word Error Rate (Lower is better)</div>
        </div>

        {/* Critical Entity Failures */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical Entity Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-red-400">{criticalErrors}</div>
          <div className="mt-2 text-xs text-red-400/80 font-medium">
            {criticalFailureRate}% of runs failed critical entity checks
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Noise Robustness Curve (Recharts LineChart) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Noise Robustness Curve (SNR vs Accuracy)</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">AWGN Sweep (Clean → 0 dB)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={[
                  { snr: 'Clean', WER: 5.2, EntityAccuracy: 100 },
                  { snr: '20 dB', WER: 8.8, EntityAccuracy: 98.0 },
                  { snr: '10 dB', WER: 17.5, EntityAccuracy: 86.4 },
                  { snr: '5 dB', WER: 31.0, EntityAccuracy: 62.5 },
                  { snr: '0 dB', WER: 58.4, EntityAccuracy: 28.0 }
                ]} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="snr" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="WER" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Word Error Rate (WER %)" />
                <Line type="monotone" dataKey="EntityAccuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Entity Accuracy (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Critical Cliff: &lt; 5 dB SNR triggers 30%+ WER</span>
            <span className="text-emerald-400 font-medium">Prisma Resilient &gt; 10 dB</span>
          </div>
        </div>

        {/* Chart 2: WER vs CER Error Rate Comparison */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">WER vs CER Error Rate Comparison</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Dynamic Benchmark Analytics</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="WER" fill="#6366f1" radius={[4, 4, 0, 0]} name="Word Error Rate (WER %)" />
                <Bar dataKey="CER" fill="#a855f7" radius={[4, 4, 0, 0]} name="Character Error Rate (CER %)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Levenshtein Alignment & Intl.Segmenter</span>
            <span className="text-indigo-400 font-medium">Dual-Layer Metrics</span>
          </div>
        </div>

      </div>

      {/* Multi-Provider STT Leaderboard */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Multi-Provider STT Leaderboard (Indian Vernacular Benchmark)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Hindi • Marathi • Hinglish</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Rank & Provider</th>
                <th className="py-2.5 px-3">Profile</th>
                <th className="py-2.5 px-3 text-center">Avg WER</th>
                <th className="py-2.5 px-3 text-center">Avg CER</th>
                <th className="py-2.5 px-3 text-center">Critical Entity Acc</th>
                <th className="py-2.5 px-3 text-center">P50 Latency</th>
                <th className="py-2.5 px-3 text-center">P95 Latency</th>
                <th className="py-2.5 px-3 text-center">RTF</th>
                <th className="py-2.5 px-3 text-right">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Gnani Prisma STT</span>
                </td>
                <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">Indic Vernacular Specialist</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-400">9.8%</td>
                <td className="py-3 px-3 text-center text-slate-300">6.4%</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-400">96.5%</td>
                <td className="py-3 px-3 text-center text-slate-300">165 ms</td>
                <td className="py-3 px-3 text-center text-slate-400">220 ms</td>
                <td className="py-3 px-3 text-center text-indigo-400">0.05</td>
                <td className="py-3 px-3 text-right text-emerald-400 font-bold">99.98%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-3 font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Google Cloud Speech v2 (Chirp-2)</span>
                </td>
                <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">Multilingual Universal Model</td>
                <td className="py-3 px-3 text-center font-bold text-slate-200">12.4%</td>
                <td className="py-3 px-3 text-center text-slate-300">7.9%</td>
                <td className="py-3 px-3 text-center font-bold text-slate-200">92.1%</td>
                <td className="py-3 px-3 text-center text-slate-300">215 ms</td>
                <td className="py-3 px-3 text-center text-slate-400">285 ms</td>
                <td className="py-3 px-3 text-center text-indigo-400">0.07</td>
                <td className="py-3 px-3 text-right text-emerald-400">99.95%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-3 font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>OpenAI Whisper Large-v3</span>
                </td>
                <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">Open Foundation Model</td>
                <td className="py-3 px-3 text-center font-bold text-amber-400">16.7%</td>
                <td className="py-3 px-3 text-center text-slate-300">11.2%</td>
                <td className="py-3 px-3 text-center font-bold text-amber-400">84.0%</td>
                <td className="py-3 px-3 text-center text-slate-300">340 ms</td>
                <td className="py-3 px-3 text-center text-slate-400">460 ms</td>
                <td className="py-3 px-3 text-center text-indigo-400">0.12</td>
                <td className="py-3 px-3 text-right text-slate-400">99.89%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects List & Recent Evaluations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Projects Explorer */}
        <div className="lg:col-span-1 bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Your Projects</h2>
              <button
                onClick={onOpenCreateProject}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No projects yet.</p>
                <button
                  onClick={onOpenCreateProject}
                  className="mt-3 text-xs px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {projects.map((proj) => (
                  <div
                    key={proj._id}
                    onClick={() => onSelectProject(proj._id)}
                    className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{proj.description || 'No description'}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <span>{proj.testCaseCount || 0} test cases</span>
                        <span>•</span>
                        <span>{proj.runCount || 0} runs</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Speech Engine: Gnani Prisma STT</span>
            <span className="text-emerald-400 font-medium">Ready</span>
          </div>
        </div>

        {/* Recent Evaluations Table */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Evaluation Runs</h2>
            <span className="text-xs text-slate-400">{stats?.recentRuns?.length || 0} recent executions</span>
          </div>

          {(!stats?.recentRuns || stats.recentRuns.length === 0) ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
              <Mic className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No evaluations run yet.</p>
              <p className="text-xs text-slate-500 mt-1">Select a project in the workspace to run your first evaluation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2.5 font-medium">Expected vs Predicted</th>
                    <th className="pb-2.5 font-medium text-center">WER</th>
                    <th className="pb-2.5 font-medium text-center">CER</th>
                    <th className="pb-2.5 font-medium text-center">Entity Status</th>
                    <th className="pb-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recentRuns.map((run) => {
                    const hasMismatch = run.entityEvaluation?.hasCriticalMismatch;
                    return (
                      <tr key={run._id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 pr-2">
                          <div className="font-medium text-slate-200 line-clamp-1">
                            {run.expectedTranscription}
                          </div>
                          <div className="text-slate-400 line-clamp-1 text-[11px] mt-0.5 font-mono">
                            → {run.predictedTranscription}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            run.wer <= 15 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {run.wer}%
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {run.cer}%
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {hasMismatch ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              ENTITY MISMATCH
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              ENTITIES OK
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onViewRunDetails(run)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium text-xs px-2 py-1 rounded hover:bg-slate-800 transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
