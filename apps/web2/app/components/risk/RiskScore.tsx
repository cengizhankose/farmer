'use client';

import { RiskScore as RiskScoreType } from "@shared/core";

interface RiskScoreProps {
  riskScore: RiskScoreType;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskScore({ riskScore, showDetails = false, size = 'md' }: RiskScoreProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          scoreText: { fontSize: '1rem', fontWeight: '600' },
          labelText: { fontSize: '0.75rem' },
          indicator: { width: '6px', height: '6px' },
          container: { gap: '0.25rem' }
        };
      case 'lg':
        return {
          scoreText: { fontSize: '1.5rem', fontWeight: '700' },
          labelText: { fontSize: '1rem' },
          indicator: { width: '12px', height: '12px' },
          container: { gap: '0.75rem' }
        };
      default:
        return {
          scoreText: { fontSize: '1.125rem', fontWeight: '600' },
          labelText: { fontSize: '0.875rem' },
          indicator: { width: '8px', height: '8px' },
          container: { gap: '0.5rem' }
        };
    }
  };

  const getRiskColor = (score: number, label: string) => {
    if (label === 'low') return '#10b981'; // green-500
    if (label === 'medium') return '#f59e0b'; // amber-500
    if (label === 'high') return '#ef4444'; // red-500

    // Fallback color based on score
    if (score <= 30) return '#10b981';
    if (score <= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const styles = getSizeStyles();
  const riskColor = getRiskColor(riskScore.total, riskScore.label);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      ...styles.container
    }}>
      {/* Risk Indicator */}
      <div style={{
        ...styles.indicator,
        borderRadius: '50%',
        backgroundColor: riskColor
      }} />

      {/* Risk Score and Label */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{
            ...styles.scoreText,
            color: riskColor
          }}>
            {Math.round(riskScore.total)}
          </span>
          {showDetails && (
            <span style={{
              ...styles.labelText,
              color: '#6b7280'
            }}>
              /100
            </span>
          )}
        </div>

        <span style={{
          ...styles.labelText,
          color: riskColor,
          textTransform: 'capitalize',
          fontWeight: '500'
        }}>
          {riskScore.label} Risk
        </span>
      </div>

      {/* Confidence Indicator */}
      {showDetails && (
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: getConfidenceColor(riskScore.confidence),
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {riskScore.confidence} Confidence
          </span>
        </div>
      )}
    </div>
  );
}