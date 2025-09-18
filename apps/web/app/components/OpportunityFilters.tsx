'use client';

import { useState, useMemo } from 'react';
import { Opportunity } from "@adapters/core";
import { OpportunityCard } from "./OpportunityCard";

interface OpportunityFiltersProps {
  opportunities: Opportunity[];
  stats: {
    byProtocol: Record<string, number>;
  };
}

export function OpportunityFilters({ opportunities, stats }: OpportunityFiltersProps) {
  const [protocolFilter, setProtocolFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'tvl' | 'apy' | 'protocol'>('tvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Apply protocol filter
    if (protocolFilter) {
      filtered = filtered.filter(opp => opp.protocol.toLowerCase() === protocolFilter.toLowerCase());
    }

    // Apply risk filter
    if (riskFilter) {
      filtered = filtered.filter(opp => opp.risk === riskFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'tvl':
          comparison = a.tvlUsd - b.tvlUsd;
          break;
        case 'apy':
          comparison = a.apy - b.apy;
          break;
        case 'protocol':
          comparison = a.protocol.localeCompare(b.protocol);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [opportunities, protocolFilter, riskFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setProtocolFilter('');
    setRiskFilter('');
    setSortBy('tvl');
    setSortOrder('desc');
  };

  return (
    <div>
      {/* Filters Section */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937', fontWeight: '600' }}>
          Filter & Sort Options
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Protocol Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
              Protocol
            </label>
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Protocols</option>
              {Object.keys(stats.byProtocol).map(protocol => (
                <option key={protocol} value={protocol}>{protocol}</option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="med">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'tvl' | 'apy' | 'protocol')}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="tvl">TVL</option>
              <option value="apy">APY</option>
              <option value="protocol">Protocol</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Clear Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
            {(protocolFilter || riskFilter) && (
              <span style={{ marginLeft: '0.5rem' }}>
                {protocolFilter && (
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginRight: '0.5rem'
                  }}>
                    Protocol: {protocolFilter}
                  </span>
                )}
                {riskFilter && (
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Risk: {riskFilter}
                  </span>
                )}
              </span>
            )}
          </div>

          {(protocolFilter || riskFilter || sortBy !== 'tvl' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredAndSortedOpportunities.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredAndSortedOpportunities.map(opportunity => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#374151' }}>
            No opportunities match your filters
          </h3>
          <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
            Try adjusting your filter criteria to see more results.
          </p>
          <button
            onClick={clearFilters}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}