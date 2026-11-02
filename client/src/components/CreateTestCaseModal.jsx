import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Mic, Sparkles } from 'lucide-react';

export default function CreateTestCaseModal({ projectId, onClose, onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('hinglish');
  const [category, setCategory] = useState('names/addresses');
  const [noiseLevel, setNoiseLevel] = useState('clean');
  const [expectedTranscription, setExpectedTranscription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  
  // Critical entities builder
  const [criticalEntities, setCriticalEntities] = useState([
    { name: 'Recipient Name', type: 'person', value: '', severity: 'CRITICAL' }
  ]);

  const handleAddEntity = () => {
    setCriticalEntities([
      ...criticalEntities,
      { name: 'Transfer Amount', type: 'amount', value: '', severity: 'CRITICAL' }
    ]);
  };

  const handleRemoveEntity = (index) => {
    setCriticalEntities(criticalEntities.filter((_, i) => i !== index));
  };

  const handleUpdateEntity = (index, field, value) => {
    const updated = [...criticalEntities];
    updated[index][field] = value;
    setCriticalEntities(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !expectedTranscription.trim()) {
      alert('Please provide test case name and expected transcription');
      return;
    }

    const filteredEntities = criticalEntities.filter((ent) => ent.value && ent.value.trim());

    onSubmit({
      name: name.trim(),
      language,
      category,
      noiseLevel,
      expectedTranscription: expectedTranscription.trim(),
      audioFile,
      criticalEntities: filteredEntities
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Create Audio Test Case</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure expected Indian-language transcription and critical business entities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Test Case Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Test Case Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UPI Recipient Mismatch (Rahul vs Rohan)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Language & Category & Noise Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="hindi">Hindi</option>
                <option value="marathi">Marathi</option>
                <option value="hinglish">Hinglish</option>
                <option value="english">English (Indian)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Scenario Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="numbers/amounts">Numbers / Amounts</option>
                <option value="names/addresses">Names / Addresses</option>
                <option value="regional pronunciation">Regional Pronunciation</option>
                <option value="background noise">Background Noise</option>
                <option value="negation/corrections">Negation / Corrections</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Acoustic Condition</label>
              <select
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="clean">Clean Studio Audio</option>
                <option value="traffic noise">Traffic Noise</option>
                <option value="background conversation">Background Chatter</option>
                <option value="low-volume">Low-volume Speech</option>
              </select>
            </div>
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Audio File <span className="text-slate-500 font-normal">(.wav, .mp3, .m4a, .flac)</span>
            </label>
            <div className="border border-dashed border-slate-800 bg-slate-950/60 rounded-xl p-4 text-center hover:border-indigo-500/50 transition">
              <input
                type="file"
                accept=".wav,.mp3,.m4a,.flac"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-indigo-400 mb-2" />
                <span className="font-semibold text-slate-300">
                  {audioFile ? audioFile.name : 'Click to select audio recording'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  {audioFile ? `${Math.round(audioFile.size / 1024)} KB` : 'If omitted, bundled benchmark audio is used'}
                </span>
              </label>
            </div>
          </div>

          {/* Expected Transcription */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Expected Reference Transcription <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={expectedTranscription}
              onChange={(e) => setExpectedTranscription(e.target.value)}
              placeholder="e.g. I want to send five hundred rupees to Rahul."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-serif"
            />
          </div>

          {/* Critical Entities Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300">Critical Entities to Verify</span>
                <p className="text-[11px] text-slate-500">
                  Values that must be accurately recognized (e.g., amount, recipient, date).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEntity}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Entity
              </button>
            </div>

            <div className="space-y-2">
              {criticalEntities.map((ent, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <input
                    type="text"
                    value={ent.name}
                    onChange={(e) => handleUpdateEntity(idx, 'name', e.target.value)}
                    placeholder="Entity Name (e.g. Recipient)"
                    className="w-1/3 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                  />
                  <select
                    value={ent.type}
                    onChange={(e) => handleUpdateEntity(idx, 'type', e.target.value)}
                    className="w-1/4 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none"
                  >
                    <option value="person">Person</option>
                    <option value="amount">Amount</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="location">Location</option>
                  </select>
                  <input
                    type="text"
                    value={ent.value}
                    onChange={(e) => handleUpdateEntity(idx, 'value', e.target.value)}
                    placeholder="Target Value (e.g. Rahul)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                  />
                  {criticalEntities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEntity(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Create Test Case'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
