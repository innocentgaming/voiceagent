import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function TestFilters({
  searchQuery,
  setSearchQuery,
  selectedLanguage,
  setSelectedLanguage,
  selectedScenario,
  setSelectedScenario
}) {
  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'hi-IN', label: 'Hindi (hi-IN)' },
    { id: 'mr-IN', label: 'Marathi (mr-IN)' },
    { id: 'hinglish', label: 'Hinglish (Code-Mixed)' },
    { id: 'en-IN', label: 'English (en-IN)' }
  ];

  const scenarios = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'banking', label: 'Banking & UPI' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'delivery', label: 'Logistics & Delivery' },
    { id: 'support', label: 'Customer Support' }
  ];

  return (
    <div className="p-3.5 rounded-[12px] bg-white dark:bg-[#111622] border border-[#e6e9ef] dark:border-[#1e2638] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="w-3.5 h-3.5 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter test cases by name or transcript..."
          className="w-full pl-8 pr-3 py-1.5 saas-control text-xs bg-[#f8f9fc] dark:bg-[#0d121c]"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 saas-control px-2.5 py-1 text-xs">
          <Filter className="w-3 h-3 text-[#697386] dark:text-[#94a3b8]" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id} className="bg-white dark:bg-[#111622]">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 saas-control px-2.5 py-1 text-xs">
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-[#111622]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

