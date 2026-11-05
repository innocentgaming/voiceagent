import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import Button from './common/Button';

export default function CreateProjectModal({ onClose, onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('voice-agent');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="saas-card relative w-full max-w-md p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ef] dark:border-[#1e2638]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#151923] dark:text-[#f1f5f9]">
              Create Testing Project
            </h2>
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
              Project Name <span className="text-[#d64545]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hindi Banking Voice Assistant"
              className="w-full saas-control px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
              Domain Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full saas-control px-3 py-2 text-xs cursor-pointer font-medium"
            >
              <option value="voice-agent">Voice Agent / Chatbot</option>
              <option value="banking-upi">Banking & UPI Payments</option>
              <option value="customer-support">Customer Support Call Center</option>
              <option value="e-commerce">E-Commerce & Delivery</option>
              <option value="telecom">Telecom IVR</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the voice application, test goals, and expected constraints."
              className="w-full saas-control p-3 text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e6e9ef] dark:border-[#1e2638]">
            <Button onClick={onClose} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
