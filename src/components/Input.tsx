import React from 'react';

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  'aria-label'?: string;
}

export default function Input({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = "",
  disabled = false,
  min,
  max,
  'aria-label': ariaLabel
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      aria-label={ariaLabel}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${className}`}
    />
  );
} 