'use client';

import React from 'react';
import { TimeSelectorProps, Timeframe } from '../../types/enhanced-data';

export function TimeSelector({
  timeframes,
  selected,
  onChange,
  disabled = false
}: TimeSelectorProps) {
  const getSelectedStyle = (timeframe: Timeframe) => {
    if (selected === timeframe) {
      return {
        backgroundColor: '#3b82f6',
        color: 'white',
        boxShadow: '0 1px 3px 0 rgba(59, 130, 246, 0.3)'
      };
    }
    return {
      backgroundColor: 'transparent',
      color: '#6b7280'
    };
  };

  const getHoverStyle = (timeframe: Timeframe) => {
    if (disabled) return {};
    if (selected === timeframe) {
      return {
        backgroundColor: '#2563eb'
      };
    }
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    };
  };

  const getTimeframeLabel = (timeframe: Timeframe) => {
    switch (timeframe) {
      case '7D':
        return '7 Days';
      case '30D':
        return '30 Days';
      case '90D':
        return '90 Days';
      default:
        return timeframe;
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      padding: '0.25rem',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'default'
    }}>
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease-in-out',
            outline: 'none',
            ...getSelectedStyle(timeframe)
          }}
          onClick={() => !disabled && onChange(timeframe)}
          onMouseEnter={(e) => {
            if (!disabled) {
              Object.assign(e.currentTarget.style, getHoverStyle(timeframe));
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              Object.assign(e.currentTarget.style, getSelectedStyle(timeframe));
            }
          }}
          disabled={disabled}
        >
          {getTimeframeLabel(timeframe)}
        </button>
      ))}
    </div>
  );
}

// Preset time selector for common use cases
export function ChartTimeSelector({
  selected,
  onChange,
  disabled = false
}: {
  selected: '7D' | '30D' | '90D';
  onChange: (timeframe: '7D' | '30D' | '90D') => void;
  disabled?: boolean;
}) {
  return (
    <TimeSelector
      timeframes={['7D', '30D', '90D']}
      selected={selected}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

// Extended time selector with more options
export function ExtendedTimeSelector({
  selected,
  onChange,
  disabled = false
}: {
  selected: '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL';
  onChange: (timeframe: '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL') => void;
  disabled?: boolean;
}) {
  const extendedTimeframes: ('24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL')[] = ['24H', '7D', '30D', '90D', '1Y', 'ALL'];

  const getTimeframeLabel = (timeframe: typeof extendedTimeframes[0]) => {
    switch (timeframe) {
      case '24H':
        return '24 Hours';
      case '7D':
        return '7 Days';
      case '30D':
        return '30 Days';
      case '90D':
        return '90 Days';
      case '1Y':
        return '1 Year';
      case 'ALL':
        return 'All Time';
      default:
        return timeframe;
    }
  };

  const getSelectedStyle = (timeframe: typeof extendedTimeframes[0]) => {
    if (selected === timeframe) {
      return {
        backgroundColor: '#3b82f6',
        color: 'white',
        boxShadow: '0 1px 3px 0 rgba(59, 130, 246, 0.3)'
      };
    }
    return {
      backgroundColor: 'transparent',
      color: '#6b7280'
    };
  };

  const getHoverStyle = (timeframe: typeof extendedTimeframes[0]) => {
    if (disabled) return {};
    if (selected === timeframe) {
      return {
        backgroundColor: '#2563eb'
      };
    }
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    };
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      padding: '0.25rem',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'default',
      flexWrap: 'wrap'
    }}>
      {extendedTimeframes.map((timeframe) => (
        <button
          key={timeframe}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease-in-out',
            outline: 'none',
            ...getSelectedStyle(timeframe)
          }}
          onClick={() => !disabled && onChange(timeframe)}
          onMouseEnter={(e) => {
            if (!disabled) {
              Object.assign(e.currentTarget.style, getHoverStyle(timeframe));
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              Object.assign(e.currentTarget.style, getSelectedStyle(timeframe));
            }
          }}
          disabled={disabled}
        >
          {getTimeframeLabel(timeframe)}
        </button>
      ))}
    </div>
  );
}