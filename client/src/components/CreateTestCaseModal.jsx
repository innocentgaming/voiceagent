import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Mic, Sparkles } from 'lucide-react';
import Button from './common/Button';
import Badge from './common/Badge';

export default function CreateTestCaseModal({ projectId, onClose, onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('hinglish');
  const [category, setCategory] = useState('banking-upi');
  const [noiseLevel, setNoiseLevel] = useState('clean');
  const [expectedTranscription, setExpectedTranscription] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  // Critical entities builder
  const [criticalEntities, setCriticalEntities] = useState([
    { entityType: 'person', expectedValue: '' }
  ]);

  const handleAddEntity = () => {
    setCriticalEntities([
      ...criticalEntities,
      { entityType: 'amount', expectedValue: '' }
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

  const handleAutoDetect = () => {
    const text = expectedTranscription;
    const detected = [];
    if (/rahul/i.test(text)) detected.push({ entityType: 'person', expectedValue: 'Rahul' });
    if (/rohan/i.test(text)) detected.push({ entityType: 'person', expectedValue: 'Rohan' });
    if (/500|five hundred|पाँच सौ/i.test(text)) detected.push({ entityType: 'amount', expectedValue: '500' });
    if (/rupees|रुपये/i.test(text)) detected.push({ entityType: 'currency', expectedValue: 'Rupees' });

    if (detected.length > 0) {
      setCriticalEntities(detected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !expectedTranscription.trim()) {
      alert('Please provide test case name and expected transcription');
      return;
    }

    const filteredEntities = criticalEntities.filter((ent) => ent.expectedValue && ent.expectedValue.trim());

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="saas-card relative w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#151923] dark:text-[#f1f5f9]">
                Add Speech AI Test Case
              </h2>
              <p className="text-xs text-[#697386] dark:text-[#94a3b8]">
                Define expected ground truth, dialect category, and critical parameters for automated regression audit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[7px] text-[#8c97a8] hover:text-[#151923] dark:hover:text-[#f1f5f9] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
              Test Case Name <span className="text-[#d64545]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UPI Payment - Rahul 500 Transfer"
              className="w-full saas-control px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full saas-control px-2.5 py-1.5 text-xs cursor-pointer font-medium"
              >
                <option value="hinglish">Hinglish (Code-Mixed)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="mr-IN">Marathi (mr-IN)</option>
                <option value="en-IN">English (en-IN)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">Domain Scenario</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full saas-control px-2.5 py-1.5 text-xs cursor-pointer font-medium"
              >
                <option value="banking-upi">Banking & UPI Payments</option>
                <option value="e-commerce">E-Commerce & Orders</option>
                <option value="delivery">Logistics & Delivery</option>
                <option value="support">Customer Support</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">Noise Condition</label>
              <select
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(e.target.value)}
                className="w-full saas-control px-2.5 py-1.5 text-xs cursor-pointer font-medium"
              >
                <option value="clean">Clean (No Noise)</option>
                <option value="snr-20db">20 dB SNR (Low Noise)</option>
                <option value="snr-10db">10 dB SNR (Moderate Traffic)</option>
                <option value="snr-0db">0 dB SNR (High Street Noise)</option>
              </select>
            </div>
          </div>

          {/* Expected Ground Truth */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#151923] dark:text-[#f1f5f9]">
                Expected Transcription (Ground Truth) <span className="text-[#d64545]">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoDetect}
                className="text-[10px] font-bold text-[#3457d5] dark:text-[#6a87f5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Detect Entities</span>
              </button>
            </div>
            <textarea
              rows={2}
              required
              value={expectedTranscription}
              onChange={(e) => setExpectedTranscription(e.target.value)}
              placeholder="e.g. I want to send five hundred rupees to Rahul (or मुझे 500 रुपये राहुल को भेजने हैं)"
              className="w-full saas-control p-2.5 text-xs font-devanagari leading-relaxed"
            />
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">Audio Recording (Optional)</label>
            <div className="p-4 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-dashed border-[#e6e9ef] dark:border-[#1e2638] flex items-center justify-center text-center cursor-pointer hover:border-[#3457d5] transition">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0] || null)}
                className="hidden"
                id="modal-audio-upload"
              />
              <label htmlFor="modal-audio-upload" className="cursor-pointer space-y-1">
                <Upload className="w-5 h-5 mx-auto text-[#3457d5] dark:text-[#6a87f5]" />
                <div className="font-semibold text-xs text-[#151923] dark:text-[#f1f5f9]">
                  {audioFile ? audioFile.name : 'Click to select audio file (WAV, MP3, OGG)'}
                </div>
                <div className="text-[10px] text-[#697386] dark:text-[#94a3b8]">Up to 25MB supported</div>
              </label>
            </div>
          </div>

          {/* Critical Entities Builder */}
          <div className="space-y-2 pt-2 border-t border-[#e6e9ef] dark:border-[#1e2638]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#151923] dark:text-[#f1f5f9]">Critical Business Entities</span>
                <p className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
                  Zero-tolerance parameters: mismatch triggers test failure even with low WER.
                </p>
              </div>
              <Button type="button" onClick={handleAddEntity} variant="outline" size="sm" icon={Plus}>
                Add Parameter
              </Button>
            </div>

            <div className="space-y-2">
              {criticalEntities.map((ent, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={ent.entityType}
                    onChange={(e) => handleUpdateEntity(idx, 'entityType', e.target.value)}
                    className="saas-control px-2.5 py-1.5 text-xs w-28 cursor-pointer font-medium"
                  >
                    <option value="person">👤 Person</option>
                    <option value="amount">💵 Amount</option>
                    <option value="currency">Rupee / Currency</option>
                    <option value="date">📅 Date</option>
                    <option value="location">📍 Location</option>
                  </select>
                  <input
                    type="text"
                    value={ent.expectedValue}
                    onChange={(e) => handleUpdateEntity(idx, 'expectedValue', e.target.value)}
                    placeholder="e.g. Rahul, 500"
                    className="flex-1 saas-control px-2.5 py-1.5 text-xs font-devanagari"
                  />
                  {criticalEntities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEntity(idx)}
                      className="p-1.5 rounded-[7px] text-[#8c97a8] hover:text-[#d64545] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#e6e9ef] dark:border-[#1e2638]">
            <Button onClick={onClose} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              {isSubmitting ? 'Saving Test Case...' : 'Save Test Case'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
