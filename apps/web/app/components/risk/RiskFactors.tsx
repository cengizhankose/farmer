'use client';

import { RiskFactor } from "@shared/core";

interface RiskFactorsProps {
  riskFactors: RiskFactor[];
  maxDisplay?: number;
  compact?: boolean;
}

export function RiskFactors({ riskFactors, maxDisplay = 5, compact = false }: RiskFactorsProps) {
  if (!riskFactors || riskFactors.length === 0) {
    return (
      <div style={{
        padding: compact ? '0.5rem' : '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <span style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          No specific risk factors identified
        </span>
      </div>
    );
  }

  const displayedFactors = riskFactors.slice(0, maxDisplay);
  const remainingCount = Math.max(0, riskFactors.length - maxDisplay);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
      case 'medium': return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' };
      case 'low': return { bg: '#f0f9ff', border: '#3b82f6', text: '#2563eb' };
      default: return { bg: '#f9fafb', border: '#6b7280', text: '#374151' };
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📊';
    }
  };

  return (
    <div style={{
      padding: compact ? '0.75rem' : '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <h4 style={{
        margin: '0 0 0.75rem 0',
        fontSize: compact ? '0.75rem' : '0.875rem',
        fontWeight: '600',
        color: '#374151'
      }}>
        Risk Factors
      </h4>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '0.5rem' : '0.75rem'
      }}>
        {displayedFactors.map((factor, index) => {
          const severityStyle = getSeverityColor(factor.severity);

          return (
            <div key={index} style={{
              padding: compact ? '0.5rem' : '0.75rem',
              backgroundColor: severityStyle.bg,
              border: `1px solid ${severityStyle.border}40`,
              borderRadius: '6px',
              borderLeft: `3px solid ${severityStyle.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: compact ? '0.875rem' : '1rem' }}>
                  {getSeverityIcon(factor.severity)}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: factor.description ? '0.25rem' : '0'
                  }}>
                    <span style={{
                      fontSize: compact ? '0.75rem' : '0.875rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {factor.name}
                    </span>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: severityStyle.text,
                      textTransform: 'capitalize',
                      backgroundColor: 'white',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${severityStyle.border}30`
                    }}>
                      {factor.severity}
                    </span>
                  </div>

                  {factor.description && !compact && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {factor.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show remaining count if there are more factors */}
      {remainingCount > 0 && (
        <div style={{
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            +{remainingCount} more risk factor{remainingCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}