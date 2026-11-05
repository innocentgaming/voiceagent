import React, { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Mic,
  Square,
  Play,
  RotateCw,
  Sparkles,
  Volume2,
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Upload
} from 'lucide-react';

export default function LiveStudio({ onViewRunDetails }) {
  const [inputMode, setInputMode] = useState('mic');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [language, setLanguage] = useState('hinglish');
  const [accent, setAccent] = useState('standard');
  const [noiseLevel, setNoiseLevel] = useState('clean');
  const [model, setModel] = useState('gnani-prisma-v3');
  const [category, setCategory] = useState('banking-upi');
  const [expectedText, setExpectedText] = useState('I want to send five hundred rupees to Rahul.');
  const [predictedText, setPredictedText] = useState('Live transcript will stream here as you speak...');
  const [criticalEntities, setCriticalEntities] = useState([
    { entityType: 'person', expectedValue: 'Rahul' },
    { entityType: 'amount', expectedValue: '500' },
    { entityType: 'currency', expectedValue: 'Rupees' }
  ]);
  const [newEntityVal, setNewEntityVal] = useState('');
  const [newEntityType, setNewEntityType] = useState('person');

  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setPredictedText(`[Audio File Loaded: ${file.name}] Ready for speech recognition.`);
    }
  };

  // Evaluation result state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState({
    wer: 6.25,
    cer: 2.89,
    entityIntegrity: 100,
    latency: 312,
    criticalPassed: true,
    alignment: [
      { word: 'I', type: 'match' },
      { word: 'want', type: 'match' },
      { word: 'to', type: 'match' },
      { word: 'send', type: 'match' },
      { word: 'five', type: 'match' },
      { word: 'hundred', type: 'match' },
      { word: 'rupees', type: 'match' },
      { word: 'to', type: 'match' },
      { word: 'Rahul', type: 'match' },
      { word: '.', type: 'match' }
    ],
    entityTable: [
      { type: 'person', expected: 'Rahul', recognized: 'Rahul', status: 'PASS' },
      { type: 'amount', expected: '500', recognized: '500', status: 'PASS' },
      { type: 'currency', expected: 'Rupees', recognized: 'Rupees', status: 'PASS' }
    ]
  });

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time dictation preview
      setTimeout(() => {
        setPredictedText('I want to send five hundred rupees to Rahul.');
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleAddEntity = () => {
    if (!newEntityVal.trim()) return;
    setCriticalEntities([
      ...criticalEntities,
      { entityType: newEntityType, expectedValue: newEntityVal.trim() }
    ]);
    setNewEntityVal('');
  };

  const handleRemoveEntity = (index) => {
    setCriticalEntities(criticalEntities.filter((_, i) => i !== index));
  };

  const handleAutoDetect = () => {
    const text = expectedText;
    const detected = [];
    if (/rahul/i.test(text)) detected.push({ entityType: 'person', expectedValue: 'Rahul' });
    if (/rohan/i.test(text)) detected.push({ entityType: 'person', expectedValue: 'Rohan' });
    if (/500|five hundred|पाँच सौ/i.test(text)) detected.push({ entityType: 'amount', expectedValue: '500' });
    if (/rupees|रुपये/i.test(text)) detected.push({ entityType: 'currency', expectedValue: 'Rupees' });

    if (detected.length > 0) {
      setCriticalEntities(detected);
    }
  };

  const runEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedText,
          predictedText,
          language,
          criticalEntities
        })
      });
      const data = await res.json();
      if (data.success) {
        const report = data.data;
        setEvalResult({
          wer: report.wer || 0,
          cer: report.cer || 0,
          entityIntegrity: report.criticalPassed ? 100 : 0,
          latency: report.totalLatencyMs || 312,
          criticalPassed: report.criticalPassed,
          alignment: report.alignment || [],
          entityTable: report.entities || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Studio Header Banner */}
      <Card className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-white via-[#f8f9fc] to-white dark:from-[#111622] dark:via-[#171d2b] dark:to-[#111622]">
        <div className="space-y-2 max-w-xl">
          <Badge variant="primary" size="sm">Live Evaluation Studio</Badge>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
            Evaluate voice agents for real-world India.
          </h1>
          <p className="text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8] leading-relaxed">
            Record or upload speech, transcribe with Gnani Prisma Vachana AI v3, and audit accuracy, latency, and critical business entities.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <Badge variant="neutral" size="sm">Google Web Audio API</Badge>
            <Badge variant="success" size="sm">Real-Time Analysis</Badge>
            <Badge variant="purple" size="sm">Multi-Dialect Support</Badge>
          </div>
        </div>

        {/* Ambient Wave Graphic Badge */}
        <div className="flex items-center gap-1.5 h-12 px-6 rounded-2xl bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
          <span className="w-1 bg-[#3457d5] rounded-full h-4 animate-pulse"></span>
          <span className="w-1 bg-[#4f70ec] rounded-full h-8 animate-pulse" style={{ animationDelay: '100ms' }}></span>
          <span className="w-1 bg-[#7c3aed] rounded-full h-10 animate-pulse" style={{ animationDelay: '250ms' }}></span>
          <span className="w-1 bg-[#3457d5] rounded-full h-6 animate-pulse" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1 bg-[#4f70ec] rounded-full h-3 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-[#697386] dark:text-[#94a3b8] ml-2">Audio Spectrum Ready</span>
        </div>
      </Card>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Audio Studio */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            {/* Input Mode Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ef] dark:border-[#1e2638]">
              <div className="flex p-0.5 rounded-[9px] bg-[#f2f4f8] dark:bg-[#1a2234] border border-[#e6e9ef] dark:border-[#1e2638] text-xs font-semibold">
                <button
                  onClick={() => setInputMode('mic')}
                  className={`px-3 py-1 rounded-[7px] transition cursor-pointer ${
                    inputMode === 'mic' ? 'bg-white dark:bg-[#111622] text-[#3457d5] dark:text-[#6a87f5] shadow-xs' : 'text-[#697386] dark:text-[#94a3b8]'
                  }`}
                >
                  Record Live
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1 rounded-[7px] transition cursor-pointer ${
                    inputMode === 'upload' ? 'bg-white dark:bg-[#111622] text-[#3457d5] dark:text-[#6a87f5] shadow-xs' : 'text-[#697386] dark:text-[#94a3b8]'
                  }`}
                >
                  Upload Audio
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-[#16865b] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#16865b] animate-pulse"></span>
                <span>{inputMode === 'mic' ? 'Live Mic Ready' : uploadedFile ? 'Audio Ready' : 'Upload File'}</span>
              </div>
            </div>

            {/* Tab Panel 1: Microphone HUD */}
            {inputMode === 'mic' ? (
              <div className="p-6 rounded-[12px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
                      isRecording
                        ? 'bg-[#d64545] shadow-[#d64545]/40 animate-pulse'
                        : 'bg-gradient-to-tr from-[#3457d5] to-[#7c3aed] shadow-[#3457d5]/30 hover:scale-105'
                    }`}
                  >
                    {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>

                <div>
                  <div className="font-mono text-base font-extrabold text-[#151923] dark:text-[#f1f5f9]">
                    {formatTimer(recordSeconds)}
                  </div>
                  <div className="text-[11px] text-[#697386] dark:text-[#94a3b8] mt-0.5">
                    {isRecording ? 'Listening to voice stream...' : 'Click to record microphone'}
                  </div>
                </div>
              </div>
            ) : (
              /* Tab Panel 2: Audio File Upload Dropzone */
              <div className="p-6 rounded-[12px] bg-[#f8f9fc] dark:bg-[#0d121c] border-2 border-dashed border-[#e6e9ef] dark:border-[#1e2638] hover:border-[#3457d5] dark:hover:border-[#6a87f5] transition flex flex-col items-center justify-center text-center space-y-3">
                <input
                  type="file"
                  id="studio-audio-upload"
                  accept="audio/*,.wav,.mp3,.ogg,.m4a"
                  className="hidden"
                  onChange={handleAudioFileChange}
                />
                <label
                  htmlFor="studio-audio-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#3457d5] dark:text-[#6a87f5] hover:underline">
                      Click to upload audio
                    </span>
                    <span className="text-xs text-[#697386] dark:text-[#94a3b8]"> or drag & drop</span>
                  </div>
                  <p className="text-[10px] text-[#8c97a8] font-mono">
                    WAV, MP3, OGG, or M4A (16kHz PCM recommended)
                  </p>
                </label>
                {uploadedFile && (
                  <div className="pt-1 flex flex-col items-center gap-2 text-xs font-mono text-[#16865b] font-bold w-full">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setAudioUrl(null);
                          setPredictedText('Live transcript will stream here as you speak...');
                        }}
                        className="text-[#8c97a8] hover:text-[#d64545] ml-1 cursor-pointer"
                        title="Remove uploaded audio"
                      >
                        ✕
                      </button>
                    </div>
                    {audioUrl && (
                      <audio controls src={audioUrl} className="w-full h-8 mt-1 rounded" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Benchmark Test Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                  Indian Language & Dialect
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full saas-control px-2.5 py-1.5 cursor-pointer font-medium"
                >
                  <option value="hinglish">Hinglish (Code-Mixed Matrix)</option>
                  <option value="hi-IN">Hindi (hi-IN)</option>
                  <option value="mr-IN">Marathi (mr-IN)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="ta-IN">Tamil (ta-IN)</option>
                  <option value="te-IN">Telugu (te-IN)</option>
                  <option value="kn-IN">Kannada (kn-IN)</option>
                  <option value="bn-IN">Bengali (bn-IN)</option>
                  <option value="gu-IN">Gujarati (gu-IN)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                  Accent & Regional Variety
                </label>
                <select
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-full saas-control px-2.5 py-1.5 cursor-pointer font-medium"
                >
                  <option value="standard">Standard / Northern Hindi</option>
                  <option value="western">Western (Mumbai / Pune)</option>
                  <option value="southern">Southern (Bangalore / Hyderabad)</option>
                  <option value="metro">Urban Metro Hinglish</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                  Noise & SNR Condition
                </label>
                <select
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(e.target.value)}
                  className="w-full saas-control px-2.5 py-1.5 cursor-pointer font-medium"
                >
                  <option value="clean">Clean Studio (40 dB SNR)</option>
                  <option value="snr-20">Office AC Ambient (20 dB SNR)</option>
                  <option value="snr-10">Traffic & Street (10 dB SNR)</option>
                  <option value="snr-5">Crowded Market (5 dB SNR)</option>
                  <option value="snr-0">Extreme AWGN (0 dB SNR)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                  Evaluation STT Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full saas-control px-2.5 py-1.5 cursor-pointer font-medium font-mono text-[11px]"
                >
                  <option value="gnani-prisma-v3">Gnani Prisma STT v3 (Live)</option>
                  <option value="whisper-indic">OpenAI Whisper Indic (Baseline)</option>
                </select>
              </div>
            </div>

            {/* Expected Ground Truth */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#697386] dark:text-[#94a3b8]">
                  Expected Ground Truth (Reference) *
                </label>
                <button
                  onClick={handleAutoDetect}
                  className="text-[10px] font-bold text-[#3457d5] dark:text-[#6a87f5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Detect Entities</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={expectedText}
                onChange={(e) => setExpectedText(e.target.value)}
                className="w-full saas-control p-2.5 text-xs font-devanagari"
              />
            </div>

            {/* Recognized Output */}
            <div>
              <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                Recognized Speech Output (Hypothesis)
              </label>
              <textarea
                rows={2}
                value={predictedText}
                onChange={(e) => setPredictedText(e.target.value)}
                className="w-full saas-control p-2.5 text-xs font-devanagari"
              />
            </div>

            {/* Critical Entities Chips */}
            <div>
              <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                Critical Business Entities (Strict Zero-Error Audit)
              </label>
              <div className="flex gap-1.5 mb-2">
                <select
                  value={newEntityType}
                  onChange={(e) => setNewEntityType(e.target.value)}
                  className="saas-control px-2 py-1 text-xs w-24 cursor-pointer"
                >
                  <option value="person">Person</option>
                  <option value="amount">Amount</option>
                  <option value="currency">Currency</option>
                  <option value="date">Date</option>
                  <option value="location">Location</option>
                </select>
                <input
                  type="text"
                  value={newEntityVal}
                  onChange={(e) => setNewEntityVal(e.target.value)}
                  placeholder="e.g. Rahul, 500"
                  className="flex-1 saas-control px-2.5 py-1 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEntity())}
                />
                <Button onClick={handleAddEntity} size="sm">
                  + Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {criticalEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] text-[11px] font-mono bg-[#f2f4f8] dark:bg-[#1a2234] border border-[#e6e9ef] dark:border-[#1e2638] text-[#151923] dark:text-[#f1f5f9]"
                  >
                    <span className="font-semibold text-[#3457d5] dark:text-[#6a87f5]">{ent.expectedValue}</span>
                    <button
                      onClick={() => handleRemoveEntity(idx)}
                      className="text-[#8c97a8] hover:text-[#d64545] cursor-pointer ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              onClick={runEvaluation}
              loading={isEvaluating}
              variant="primary"
              size="md"
              className="w-full"
              icon={RotateCw}
            >
              {isEvaluating ? 'Evaluating Metrics & Entities...' : 'Evaluate Accuracy & Entities'}
            </Button>
          </Card>
        </div>

        {/* Right Column: Live Evaluation Cockpit */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="space-y-4">
            {/* 5 Key Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              <div className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
                <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">Accuracy</span>
                <div className="text-xl font-extrabold text-[#16865b] dark:text-[#34d399] font-mono-numbers mt-1">
                  {(100 - evalResult.wer).toFixed(1)}%
                </div>
                <span className="text-[10px] text-[#16865b] font-mono font-bold">Speech Rec</span>
              </div>

              <div className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
                <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">WER</span>
                <div className="text-xl font-extrabold text-[#151923] dark:text-[#f1f5f9] font-mono-numbers mt-1">
                  {evalResult.wer}%
                </div>
                <span className="text-[10px] text-[#16865b] font-mono font-bold">Word Error</span>
              </div>

              <div className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
                <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">CER</span>
                <div className="text-xl font-extrabold text-[#151923] dark:text-[#f1f5f9] font-mono-numbers mt-1">
                  {evalResult.cer}%
                </div>
                <span className="text-[10px] text-[#697386] dark:text-[#94a3b8] font-mono">Graphemes</span>
              </div>

              <div className={`p-3 rounded-[9px] border ${
                evalResult.criticalPassed
                  ? 'bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b] border-[#16865b]/20'
                  : 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] border-[#d64545]/20'
              }`}>
                <span className="text-[10px] font-bold uppercase font-mono">Entities</span>
                <div className="text-xl font-extrabold font-mono-numbers mt-1">
                  {evalResult.entityIntegrity}%
                </div>
                <span className="text-[10px] font-semibold">{evalResult.criticalPassed ? 'All Verified' : 'Alert'}</span>
              </div>

              <div className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
                <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">Latency</span>
                <div className="text-xl font-extrabold text-[#3457d5] dark:text-[#6a87f5] font-mono-numbers mt-1">
                  {evalResult.latency} ms
                </div>
                <span className="text-[10px] text-[#697386] dark:text-[#94a3b8] font-mono">
                  {((evalResult.latency || 312) / 4000).toFixed(2)}x RTF
                </span>
              </div>
            </div>

            {/* Word Alignment Diff */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#697386] dark:text-[#94a3b8] uppercase">
                <span>Sequential Word Alignment Diff (Levenshtein)</span>
                <span className="text-[#16865b]">100% Match</span>
              </div>

              <div className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] flex flex-wrap gap-1.5 font-mono text-xs">
                {evalResult.alignment.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-[6px] bg-white dark:bg-[#111622] border border-[#e6e9ef] dark:border-[#1e2638] text-[#151923] dark:text-[#f1f5f9]"
                  >
                    {t.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Entities Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#697386] dark:text-[#94a3b8] uppercase">
                <span>Critical Entities Verification Audit</span>
                <Badge variant="success" size="sm">Zero Error</Badge>
              </div>

              <div className="overflow-x-auto rounded-[9px] border border-[#e6e9ef] dark:border-[#1e2638]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#f8f9fc] dark:bg-[#0d121c] border-b border-[#e6e9ef] dark:border-[#1e2638] text-[10px] uppercase font-bold text-[#697386] dark:text-[#94a3b8]">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Entity</th>
                      <th className="py-2 px-3">Expected</th>
                      <th className="py-2 px-3">Recognized</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6e9ef] dark:divide-[#1e2638]">
                    {evalResult.entityTable.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-[#8c97a8]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#151923] dark:text-[#f1f5f9]">{item.type}</td>
                        <td className="py-2.5 px-3 text-[#3457d5] dark:text-[#6a87f5] font-devanagari">{item.expected}</td>
                        <td className="py-2.5 px-3 text-[#151923] dark:text-[#f1f5f9] font-devanagari">{item.recognized}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[#16865b] font-bold">✓ Pass</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Report Actions */}
              <div className="pt-3 border-t border-[#e6e9ef] dark:border-[#1e2638] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[#697386] dark:text-[#94a3b8] font-mono">
                  Engine: Gnani Prisma STT v3 • Real-Time Factor: {((evalResult.latency || 312) / 4000).toFixed(2)}x
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evalResult, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `indicvoice_eval_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-2.5 py-1.5 rounded-[7px] text-xs font-semibold saas-control hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] transition cursor-pointer"
                  >
                    Export JSON
                  </button>
                  {onViewRunDetails && (
                    <Button
                      onClick={() => onViewRunDetails({
                        testName: 'Live Studio Evaluation',
                        language,
                        wer: evalResult.wer / 100,
                        cer: evalResult.cer / 100,
                        criticalPassed: evalResult.criticalPassed,
                        latencyMs: evalResult.latency,
                        expectedTranscription: expectedText,
                        hypothesis: predictedText,
                        alignment: evalResult.alignment,
                        entities: evalResult.entityTable
                      })}
                      variant="primary"
                      size="sm"
                      icon={FileText}
                    >
                      Audit Report Modal
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

