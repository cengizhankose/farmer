'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { ValueProjection, Timeframe } from '../../types/enhanced-data';

interface ValueProjectionsProps {
  projections: ValueProjection[];
  currentTvl: number;
  timeframe?: Timeframe;
  showScenarios?: boolean;
  showChart?: boolean;
}

interface ScenarioCardProps {
  title: string;
  scenario: 'bearish' | 'neutral' | 'bullish';
  projection: ValueProjection;
  currentTvl: number;
  color: string;
  bgColor: string;
}

function ScenarioCard({ title, scenario, projection, currentTvl, color, bgColor }: ScenarioCardProps) {
  const scenarioData = projection.scenarios[scenario];
  const growthPercentage = ((scenarioData.projectedValue - currentTvl) / currentTvl) * 100;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color
        }} />
        <h4 style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          {title}
        </h4>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: color
        }}>
          ${scenarioData.projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span style={{
          fontSize: '0.875rem',
          color: growthPercentage >= 0 ? '#10b981' : '#ef4444',
          marginLeft: '0.5rem'
        }}>
          {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Probability:</span>
          <span style={{ color: '#1f2937', fontWeight: '500' }}>
            {(scenarioData.probability * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Confidence:</span>
          <span style={{ color: '#1f2937', fontWeight: '500' }}>
            {(scenarioData.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Range:</span>
          <span style={{ color: '#1f2937', fontWeight: '500' }}>
            ${scenarioData.range[0].toLocaleString()} - ${scenarioData.range[1].toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ValueProjections({
  projections,
  currentTvl,
  timeframe = '30D',
  showScenarios = true,
  showChart = true
}: ValueProjectionsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(timeframe);

  const filteredProjections = projections.filter(p => {
    const timeframeMap: Record<Timeframe, string> = {
      '7D': '7d',
      '30D': '30d',
      '90D': '90d'
    };
    return p.timeframe === timeframeMap[selectedTimeframe];
  });

  const projection = filteredProjections[0];

  if (!projection) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '1rem',
        color: '#991b1b'
      }}>
        No projection data available for {selectedTimeframe}.
      </div>
    );
  }

  // Transform data for chart
  const generateProjectionData = () => {
    const data = [];
    const days = parseInt(projection.timeframe.replace('d', ''));
    const dailyVolatility = projection.volatility / Math.sqrt(days);

    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Generate projection paths for each scenario
      const bearishValue = currentTvl * Math.exp(
        (Math.log(projection.scenarios.bearish.projectedValue / currentTvl) / days) * i +
        (-dailyVolatility * Math.sqrt(i) * 1.5)
      );

      const neutralValue = currentTvl * Math.exp(
        (Math.log(projection.scenarios.neutral.projectedValue / currentTvl) / days) * i
      );

      const bullishValue = currentTvl * Math.exp(
        (Math.log(projection.scenarios.bullish.projectedValue / currentTvl) / days) * i +
        (dailyVolatility * Math.sqrt(i) * 1.5)
      );

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        bearish: Math.max(0, bearishValue),
        neutral: Math.max(0, neutralValue),
        bullish: Math.max(0, bullishValue),
        expected: currentTvl + ((projection.expectedValue - currentTvl) * (i / days))
      });
    }
    return data;
  };

  const chartData = generateProjectionData();

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const timeframes: Timeframe[] = ['7D', '30D', '90D'];

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      padding: '1.5rem',
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
            Value Projections
          </h3>
          <p style={{
            margin: '0.25rem 0 0 0',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Monte Carlo simulation based on {projection.simulationCount.toLocaleString()} scenarios
          </p>
        </div>

        {/* Timeframe Selector */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          padding: '0.25rem'
        }}>
          {timeframes.map((tf) => (
            <button
              key={tf}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: selectedTimeframe === tf ? 'white' : 'transparent',
                color: selectedTimeframe === tf ? '#1f2937' : '#6b7280',
                cursor: 'pointer',
                boxShadow: selectedTimeframe === tf ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Current TVL
          </p>
          <p style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            {formatCurrency(currentTvl)}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Expected Value
          </p>
          <p style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#3b82f6'
          }}>
            {formatCurrency(projection.expectedValue)}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Volatility
          </p>
          <p style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#f59e0b'
          }}>
            {(projection.volatility * 100).toFixed(1)}%
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Confidence Interval
          </p>
          <p style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: '#6b7280'
          }}>
            {formatCurrency(projection.confidenceInterval[0])} - {formatCurrency(projection.confidenceInterval[1])}
          </p>
        </div>
      </div>

      {/* Projection Chart */}
      {showChart && (
        <div style={{
          marginBottom: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            Projection Chart ({selectedTimeframe})
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                fontSize={12}
                tick={{ fill: '#6b7280' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="bearish"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.1}
                strokeWidth={1}
                name="Bearish"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stroke="#6b7280"
                fill="#6b7280"
                fillOpacity={0.1}
                strokeWidth={2}
                name="Neutral"
              />
              <Area
                type="monotone"
                dataKey="bullish"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
                strokeWidth={1}
                name="Bullish"
              />
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Expected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scenario Cards */}
      {showScenarios && (
        <div>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            Scenario Analysis
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <ScenarioCard
              title="Bearish Scenario"
              scenario="bearish"
              projection={projection}
              currentTvl={currentTvl}
              color="#ef4444"
              bgColor="#fef2f2"
            />
            <ScenarioCard
              title="Neutral Scenario"
              scenario="neutral"
              projection={projection}
              currentTvl={currentTvl}
              color="#6b7280"
              bgColor="#f9fafb"
            />
            <ScenarioCard
              title="Bullish Scenario"
              scenario="bullish"
              projection={projection}
              currentTvl={currentTvl}
              color="#10b981"
              bgColor="#ecfdf5"
            />
          </div>
        </div>
      )}

      {/* Methodology Note */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        border: '1px solid #0ea5e920'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#0369a1'
        }}>
          <strong>Methodology:</strong> Projections are generated using Monte Carlo simulations based on historical volatility,
          market trends, and risk factors. These are forward-looking estimates and should not be considered financial advice.
          Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}