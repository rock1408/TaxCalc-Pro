import React, { useState } from 'react';

interface ValidatedNumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  placeholder?: string;
  tooltip?: string;
  className?: string;
}

export default function ValidatedNumberInput({
  id,
  label,
  value,
  onChange,
  prefix,
  placeholder = '0',
  tooltip,
  className = '',
}: ValidatedNumberInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    if (rawVal === '') {
      setError(null);
      onChange(0);
      return;
    }

    const num = Number(rawVal);
    if (isNaN(num)) {
      setError('Please enter a valid number');
    } else if (num < 0) {
      setError('Negative values are not allowed');
      onChange(0);
    } else {
      setError(null);
      // Clean up rounding floating-point issues on input
      onChange(Math.max(0, parseFloat(num.toFixed(4))));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block '-' and 'e' keys
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
      setError('Negative signs and scientific notations are blocked');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    // Regex matches negative numbers or alphabetic strings
    if (/[-\de]+/.test(pastedText)) {
      const sanitized = pastedText.replace(/[^0-9.]/g, '');
      const num = parseFloat(sanitized);
      if (isNaN(num) || num < 0) {
        e.preventDefault();
        setError('Invalid numeric paste blocked');
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`} id={`container_${id}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        {tooltip && (
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium" title={tooltip}>
            {tooltip}
          </span>
        )}
      </div>

      <div className="relative rounded-lg shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-slate-500 font-mono text-xs">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          name={id}
          id={id}
          min="0"
          step="any"
          value={value === 0 ? '' : value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          className={`block w-full rounded-lg border text-xs font-medium font-mono transition-colors focus:ring-2 focus:ring-blue-500/20 focus:outline-none py-2.5 ${
            prefix ? 'pl-8' : 'pl-3'
          } pr-3 ${
            error
              ? 'border-red-500 text-red-900 bg-red-50/30 dark:bg-red-950/10 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-900/60 focus:border-blue-500'
          }`}
          placeholder={placeholder}
        />
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-semibold" id={`error_${id}`}>
          {error}
        </p>
      )}
    </div>
  );
}
