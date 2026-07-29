import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, Check } from 'lucide-react';
import './TimeRangeSelector.css';

const TIME_RANGE_OPTIONS = [
  { id: '24h', label: 'Last 24 Hours', shortLabel: '24h' },
  { id: '7d', label: 'Last 7 Days', shortLabel: '7d' },
  { id: '30d', label: 'Last 30 Days', shortLabel: '30d' },
  { id: '90d', label: 'Last 3 Months', shortLabel: '90d' },
  { id: 'all', label: 'All Time', shortLabel: 'All' },
  { id: 'custom', label: 'Custom Range', shortLabel: 'Custom' }
];

export default function TimeRangeSelector({ selectedRange, onRangeChange, customStartDate, customEndDate, onCustomDateChange }) {
  const [showCustomInputs, setShowCustomInputs] = useState(selectedRange === 'custom');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (rangeId) => {
    onRangeChange(rangeId);
    if (rangeId === 'custom') {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
    }
    setDropdownOpen(false);
  };

  const selectedOption = TIME_RANGE_OPTIONS.find((opt) => opt.id === selectedRange) || TIME_RANGE_OPTIONS[1];

  return (
    <div className="time-range-selector-wrapper">
      {/* Quick Select Pill Buttons for Desktop */}
      <div className="time-range-pills" role="radiogroup" aria-label="Select statistics time range">
        <div className="range-icon-label">
          <Calendar size={14} color="#38bdf8" />
          <span>Time Range:</span>
        </div>

        {TIME_RANGE_OPTIONS.map((opt) => {
          const isSelected = selectedRange === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`range-pill ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelect(opt.id)}
              aria-checked={isSelected}
              role="radio"
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Selector for Mobile / Compact View */}
      <div className="time-range-dropdown-container">
        <button
          type="button"
          className="dropdown-trigger-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Clock size={15} color="#38bdf8" />
          <span>{selectedOption.label}</span>
          <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="dropdown-menu">
            {TIME_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`dropdown-item ${selectedRange === opt.id ? 'active' : ''}`}
                onClick={() => handleSelect(opt.id)}
              >
                <span>{opt.label}</span>
                {selectedRange === opt.id && <Check size={14} color="#38bdf8" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Date Range Picker Fields */}
      {(selectedRange === 'custom' || showCustomInputs) && (
        <div className="custom-date-inputs">
          <div className="date-field">
            <label htmlFor="start-date" className="date-label">Start Date</label>
            <input
              type="date"
              id="start-date"
              className="date-input"
              value={customStartDate || ''}
              onChange={(e) => onCustomDateChange('start', e.target.value)}
            />
          </div>
          <div className="date-field-separator">to</div>
          <div className="date-field">
            <label htmlFor="end-date" className="date-label">End Date</label>
            <input
              type="date"
              id="end-date"
              className="date-input"
              value={customEndDate || ''}
              onChange={(e) => onCustomDateChange('end', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
