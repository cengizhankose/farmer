'use client';

import React, { useState } from 'react';
import { RiskScore } from '@shared/core';
import {
  EnhancedRiskBreakdownProps,
  EnhancedLiquidityData,
  EnhancedStabilityData,
  EnhancedYieldData,
  EnhancedConcentrationData,
  EnhancedMomentumData
} from '../../types/enhanced-data';

interface RiskComponentDetail {
  key: string;
  label: string;
  weight: number;
  score: number;
  factors: {
    name: string;
    value: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export function EnhancedRiskBreakdown({
  riskScore,
  enhancedData,
  showDetails = true,
  showFactors = true
}: EnhancedRiskBreakdownProps) {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const getComponentDetails = (): RiskComponentDetail[] => {
    return [
      {
        key: 'liquidity',
        label: 'Liquidity Risk',
        weight: 30,
        score: riskScore.components.liquidity,
        factors: [
          {
            name: 'TVL Depth',
            value: enhancedData.liquidity.currentTvl,
            impact: enhancedData.liquidity.currentTvl > 10000000 ? 'positive' : 'negative',
            description: `Current TVL: $${(enhancedData.liquidity.currentTvl / 1e6).toFixed(1)}M`,
            severity: enhancedData.liquidity.currentTvl > 10000000 ? 'low' : enhancedData.liquidity.currentTvl > 1000000 ? 'medium' : 'high'
          },
          {
            name: 'Volume Consistency',
            value: enhancedData.liquidity.volume24h,
            impact: enhancedData.liquidity.volume24h > 100000 ? 'positive' : 'negative',
            description: `24h Volume: $${(enhancedData.liquidity.volume24h / 1e3).toFixed(0)}K`,
            severity: enhancedData.liquidity.volume24h > 100000 ? 'low' : enhancedData.liquidity.volume24h > 10000 ? 'medium' : 'high'
          },
          {
            name: 'Turnover Ratio',
            value: enhancedData.liquidity.turnoverRatio,
            impact: enhancedData.liquidity.turnoverRatio > 0.1 ? 'positive' : 'negative',
            description: `Turnover: ${(enhancedData.liquidity.turnoverRatio * 100).toFixed(1)}%`,
            severity: enhancedData.liquidity.turnoverRatio > 0.1 ? 'low' : enhancedData.liquidity.turnoverRatio > 0.05 ? 'medium' : 'high'
          }
        ]
      },
      {
        key: 'stability',
        label: 'Stability Risk',
        weight: 25,
        score: riskScore.components.stability,
        factors: [
          {
            name: 'TVL Volatility',
            value: enhancedData.stability.tvlVolatility30d,
            impact: enhancedData.stability.tvlVolatility30d < 0.1 ? 'positive' : 'negative',
            description: `30-day volatility: ${(enhancedData.stability.tvlVolatility30d * 100).toFixed(1)}%`,
            severity: enhancedData.stability.tvlVolatility30d < 0.1 ? 'low' : enhancedData.stability.tvlVolatility30d < 0.2 ? 'medium' : 'high'
          },
          {
            name: 'Max Drawdown',
            value: enhancedData.stability.maxDrawdown30d,
            impact: enhancedData.stability.maxDrawdown30d < 0.1 ? 'positive' : 'negative',
            description: `30-day max drawdown: ${(enhancedData.stability.maxDrawdown30d * 100).toFixed(1)}%`,
            severity: enhancedData.stability.maxDrawdown30d < 0.1 ? 'low' : enhancedData.stability.maxDrawdown30d < 0.2 ? 'medium' : 'high'
          },
          {
            name: 'Trend Consistency',
            value: enhancedData.stability.trendConsistency,
            impact: enhancedData.stability.trendConsistency > 0.7 ? 'positive' : 'negative',
            description: `Trend consistency: ${(enhancedData.stability.trendConsistency * 100).toFixed(0)}%`,
            severity: enhancedData.stability.trendConsistency > 0.7 ? 'low' : enhancedData.stability.trendConsistency > 0.4 ? 'medium' : 'high'
          }
        ]
      },
      {
        key: 'yield',
        label: 'Yield Risk',
        weight: 20,
        score: riskScore.components.yield,
        factors: [
          {
            name: 'APR Level',
            value: enhancedData.yield.apr,
            impact: enhancedData.yield.apr < 0.25 ? 'positive' : 'negative',
            description: `Current APR: ${(enhancedData.yield.apr * 100).toFixed(1)}%`,
            severity: enhancedData.yield.apr < 0.25 ? 'low' : enhancedData.yield.apr < 0.50 ? 'medium' : 'high'
          },
          {
            name: 'Yield Volatility',
            value: enhancedData.yield.aprVolatility30d,
            impact: enhancedData.yield.aprVolatility30d < 0.1 ? 'positive' : 'negative',
            description: `APR volatility: ${(enhancedData.yield.aprVolatility30d * 100).toFixed(1)}%`,
            severity: enhancedData.yield.aprVolatility30d < 0.1 ? 'low' : enhancedData.yield.aprVolatility30d < 0.2 ? 'medium' : 'high'
          },
          {
            name: 'Reward Dependency',
            value: enhancedData.yield.rewardDependencyRatio,
            impact: enhancedData.yield.rewardDependencyRatio < 0.5 ? 'positive' : 'negative',
            description: `Reward ratio: ${(enhancedData.yield.rewardDependencyRatio * 100).toFixed(0)}%`,
            severity: enhancedData.yield.rewardDependencyRatio < 0.5 ? 'low' : enhancedData.yield.rewardDependencyRatio < 0.8 ? 'medium' : 'high'
          }
        ]
      },
      {
        key: 'concentration',
        label: 'Concentration Risk',
        weight: 15,
        score: riskScore.components.concentration,
        factors: [
          {
            name: 'Holder Concentration',
            value: enhancedData.concentration.top10HolderPercentage,
            impact: enhancedData.concentration.top10HolderPercentage < 50 ? 'positive' : 'negative',
            description: `Top 10 holders: ${(enhancedData.concentration.top10HolderPercentage * 100).toFixed(1)}%`,
            severity: enhancedData.concentration.top10HolderPercentage < 50 ? 'low' : enhancedData.concentration.top10HolderPercentage < 80 ? 'medium' : 'high'
          },
          {
            name: 'Gini Coefficient',
            value: enhancedData.concentration.giniCoefficient,
            impact: enhancedData.concentration.giniCoefficient < 0.6 ? 'positive' : 'negative',
            description: `Gini coefficient: ${enhancedData.concentration.giniCoefficient.toFixed(2)}`,
            severity: enhancedData.concentration.giniCoefficient < 0.6 ? 'low' : enhancedData.concentration.giniCoefficient < 0.8 ? 'medium' : 'high'
          },
          {
            name: 'Decentralization Level',
            value: enhancedData.concentration.holderCount,
            impact: enhancedData.concentration.holderCount > 1000 ? 'positive' : 'negative',
            description: `Decentralization: ${enhancedData.concentration.decentralizationLevel}`,
            severity: enhancedData.concentration.decentralizationLevel === 'high' ? 'low' : enhancedData.concentration.decentralizationLevel === 'medium' ? 'medium' : 'high'
          }
        ]
      },
      {
        key: 'momentum',
        label: 'Momentum Risk',
        weight: 10,
        score: riskScore.components.momentum,
        factors: [
          {
            name: 'TVL Growth',
            value: enhancedData.momentum.tvlGrowth7d,
            impact: enhancedData.momentum.tvlGrowth7d > 0 ? 'positive' : 'negative',
            description: `7-day TVL growth: ${(enhancedData.momentum.tvlGrowth7d * 100).toFixed(2)}%`,
            severity: enhancedData.momentum.tvlGrowth7d > 0 ? 'low' : enhancedData.momentum.tvlGrowth7d > -0.05 ? 'medium' : 'high'
          },
          {
            name: 'Volume Growth',
            value: enhancedData.momentum.volumeGrowth7d,
            impact: enhancedData.momentum.volumeGrowth7d > 0 ? 'positive' : 'negative',
            description: `7-day volume growth: ${(enhancedData.momentum.volumeGrowth7d * 100).toFixed(2)}%`,
            severity: enhancedData.momentum.volumeGrowth7d > 0 ? 'low' : enhancedData.momentum.volumeGrowth7d > -0.05 ? 'medium' : 'high'
          },
          {
            name: 'Trend Strength',
            value: enhancedData.momentum.trendStrength,
            impact: enhancedData.momentum.trendStrength > 0.6 ? 'positive' : 'negative',
            description: `Trend strength: ${(enhancedData.momentum.trendStrength * 100).toFixed(0)}%`,
            severity: enhancedData.momentum.trendStrength > 0.6 ? 'low' : enhancedData.momentum.trendStrength > 0.3 ? 'medium' : 'high'
          }
        ]
      }
    ];
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return '#10b981'; // green
    if (score <= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getScoreBackground = (score: number) => {
    if (score <= 30) return '#ecfdf5'; // green background
    if (score <= 60) return '#fffbeb'; // amber background
    return '#fef2f2'; // red background
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const componentDetails = getComponentDetails();

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Enhanced Risk Analysis
          </h3>
          <p style={{
            margin: '0.25rem 0 0 0',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            5-component risk breakdown with detailed factors
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: getScoreBackground(riskScore.total),
          borderRadius: '8px',
          border: `1px solid ${getScoreColor(riskScore.total)}20`
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getScoreColor(riskScore.total)
          }}>
            {riskScore.total}
          </span>
          <span style={{
            fontSize: '0.875rem',
            color: getScoreColor(riskScore.total),
            fontWeight: '500'
          }}>
            Total Risk Score
          </span>
        </div>
      </div>

      {/* Risk Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {componentDetails.map((component) => (
          <div key={component.key} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            {/* Component Header */}
            <div
              style={{
                padding: '1rem',
                cursor: showDetails ? 'pointer' : 'default',
                backgroundColor: getScoreBackground(component.score),
                borderBottom: expandedComponent === component.key ? '1px solid #e5e7eb' : 'none'
              }}
              onClick={() => showDetails && setExpandedComponent(
                expandedComponent === component.key ? null : component.key
              )}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getScoreColor(component.score),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {component.score}
                  </div>
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {component.label}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {component.weight}% weight
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '60px',
                    height: '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${component.score}%`,
                      height: '100%',
                      backgroundColor: getScoreColor(component.score),
                      borderRadius: '3px'
                    }} />
                  </div>
                  {showDetails && (
                    <span style={{
                      fontSize: '1rem',
                      color: '#6b7280',
                      transform: expandedComponent === component.key ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▼
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Factors */}
            {showDetails && expandedComponent === component.key && (
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {component.factors.map((factor, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: `1px solid ${getImpactColor(factor.impact)}20`
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getImpactColor(factor.impact)
                          }} />
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#1f2937'
                          }}>
                            {factor.name}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            backgroundColor: getSeverityColor(factor.severity),
                            color: 'white',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {factor.severity}
                          </span>
                        </div>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          {factor.description}
                        </p>
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: getImpactColor(factor.impact)
                      }}>
                        {factor.impact === 'positive' ? '✓' : factor.impact === 'negative' ? '⚠' : '•'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Risk Drivers */}
      {showFactors && riskScore.drivers && riskScore.drivers.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            Key Risk Drivers
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {riskScore.drivers.map((driver, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #f59e0b20'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  #{index + 1}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  {driver}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <span style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Analysis Confidence:
        </span>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: riskScore.confidence === 'high' ? '#059669' : riskScore.confidence === 'medium' ? '#d97706' : '#dc2626'
        }}>
          {' '}{riskScore.confidence.toUpperCase()}
        </span>
      </div>
    </div>
  );
}