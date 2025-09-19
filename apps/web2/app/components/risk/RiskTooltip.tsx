'use client';

import { useState } from 'react';
import { RiskScore } from "@shared/core";

interface RiskTooltipProps {
  riskScore: RiskScore;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function RiskTooltip({ riskScore, children, position = 'top' }: RiskTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    const base = {
      position: 'absolute' as const,
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      width: '280px',
      fontSize: '0.875rem'
    };

    switch (position) {
      case 'top':
        return {
          ...base,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        };
      case 'bottom':
        return {
          ...base,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px'
        };
      case 'left':
        return {
          ...base,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '8px'
        };
      case 'right':
        return {
          ...base,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px'
        };
      default:
        return base;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return '#10b981';
    if (score <= 60) return '#f59e0b';
    return '#ef4444';
  };

  const components = [
    { key: 'liquidity', label: 'Liquidity', weight: 30 },
    { key: 'stability', label: 'Stability', weight: 25 },
    { key: 'yield', label: 'Yield', weight: 20 },
    { key: 'concentration', label: 'Concentration', weight: 15 },
    { key: 'momentum', label: 'Momentum', weight: 10 },
  ];

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div style={getPositionStyles()}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: getRiskColor(riskScore.total)
              }}>
                Risk Score: {Math.round(riskScore.total)}
              </span>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textTransform: 'capitalize'
              }}>
                {riskScore.label} Risk • {riskScore.confidence} Confidence
              </div>
            </div>
          </div>

          {/* Component Breakdown */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Component Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {components.map(({ key, label, weight }) => {
                const score = riskScore.components[key as keyof typeof riskScore.components] || 0;
                return (
                  <div key={key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>
                      {label} ({weight}%)
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: getRiskColor(score)
                    }}>
                      {Math.round(score)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Drivers */}
          {riskScore.drivers && riskScore.drivers.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Key Risk Drivers
              </div>
              <ul style={{
                margin: 0,
                padding: '0 0 0 1rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                {riskScore.drivers.slice(0, 3).map((driver, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {driver}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tooltip Arrow */}
          <div style={{
            position: 'absolute',
            ...getArrowPosition(),
            width: 0,
            height: 0,
            borderStyle: 'solid',
            ...getArrowBorder()
          }} />
        </div>
      )}
    </div>
  );

  function getArrowPosition() {
    switch (position) {
      case 'top':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)' };
      default:
        return {};
    }
  }

  function getArrowBorder() {
    switch (position) {
      case 'top':
        return {
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid white'
        };
      case 'bottom':
        return {
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '6px solid white'
        };
      case 'left':
        return {
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '6px solid white'
        };
      case 'right':
        return {
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid white'
        };
      default:
        return {};
    }
  }
}