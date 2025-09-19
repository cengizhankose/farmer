'use client';

import { RiskScore } from "@shared/core";

interface RiskBreakdownProps {
  riskScore: RiskScore;
  showBars?: boolean;
}

export function RiskBreakdown({ riskScore, showBars = true }: RiskBreakdownProps) {
  const components = [
    { key: 'liquidity', label: 'Liquidity Risk', weight: 30 },
    { key: 'stability', label: 'Stability Risk', weight: 25 },
    { key: 'yield', label: 'Yield Risk', weight: 20 },
    { key: 'concentration', label: 'Concentration Risk', weight: 15 },
    { key: 'momentum', label: 'Momentum Risk', weight: 10 },
  ];

  const getComponentColor = (score: number) => {
    if (score <= 30) return '#10b981'; // green
    if (score <= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getBackgroundColor = (score: number) => {
    if (score <= 30) return '#ecfdf5'; // green background
    if (score <= 60) return '#fffbeb'; // amber background
    return '#fef2f2'; // red background
  };

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <h4 style={{
        margin: '0 0 0.75rem 0',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151'
      }}>
        Risk Component Breakdown
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {components.map(({ key, label, weight }) => {
          const score = riskScore.components[key as keyof typeof riskScore.components] || 0;
          const color = getComponentColor(score);
          const bgColor = getBackgroundColor(score);

          return (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem',
              backgroundColor: bgColor,
              borderRadius: '6px',
              border: `1px solid ${color}20`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    {label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {weight}% weight
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color
                    }}>
                      {Math.round(score)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {showBars && (
                  <div style={{
                    marginTop: '0.25rem',
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(score, 100)}%`,
                      height: '100%',
                      backgroundColor: color,
                      borderRadius: '2px',
                      transition: 'width 0.3s ease-in-out'
                    }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Drivers */}
      {riskScore.drivers && riskScore.drivers.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <h5 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            Key Risk Drivers
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {riskScore.drivers.slice(0, 3).map((driver, index) => (
              <span key={index} style={{
                fontSize: '0.75rem',
                color: '#374151',
                padding: '0.25rem 0',
                borderLeft: '2px solid #e5e7eb',
                paddingLeft: '0.5rem'
              }}>
                {driver}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}